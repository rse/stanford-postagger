/*
**  Stanford-PoSTagger -- Stanford Log-Linear Part-Of-Speech (PoS) Tagger
**  Copyright (c) 2018-2019 Dr. Ralf S. Engelschall <rse@engelschall.com>
**
**  Permission is hereby granted, free of charge, to any person obtaining
**  a copy of this software and associated documentation files (the
**  "Software"), to deal in the Software without restriction, including
**  without limitation the rights to use, copy, modify, merge, publish,
**  distribute, sublicense, and/or sell copies of the Software, and to
**  permit persons to whom the Software is furnished to do so, subject to
**  the following conditions:
**
**  The above copyright notice and this permission notice shall be included
**  in all copies or substantial portions of the Software.
**
**  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
**  EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
**  MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
**  IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
**  CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
**  TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
**  SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

/*  internal requirements  */
const path           = require("path")
const fs             = require("mz/fs")

/*  external requirements  */
const which          = require("which")
const EventEmitter   = require("eventemitter3")
const execa          = require("execa")

/*  the API class  */
class PoSTagger extends EventEmitter {
    constructor (options = {}) {
        super()

        /*  determine options  */
        this.options = Object.assign({}, {
            javaBinary:  "java",
            javaOptions: "-server -Xms1G -Xmx1G",
            tagger:      path.join(__dirname, "stanford-postagger.d/stanford-postagger.jar"),
            model:       "english"
        }, options)

        /*  initialize internal state  */
        this.proc     = null
        this.queueIn  = []
        this.queueOut = []
    }

    /*  start the Stanford PoS-Tagger service  */
    async start () {
        /*  sanity check usage  */
        if (this.proc !== null)
            throw new Error("Stanford PoS-Tagger process already running")

        /*  resolve path to Java binary  */
        let javaBinary = await new Promise((resolve, reject) => {
            which(this.options.javaBinary, (error, filename) => {
                if (error)
                    reject(new Error("unable to find mandatory Java binary " +
                        `"${this.options.javaBinary}" in your $PATH`))
                else
                    resolve(filename)
            })
        })

        /*  resolve model  */
        let model = this.options.model
        let aliases = {
            "english":     "english-left3words-distsim",
            "english-alt": "wsj-0-18-left3words-distsim",
            "german":      "german-hgc",
            "french":      "french",
            "spanish":     "spanish",
            "arabic":      "arabic",
            "chinese":     "chinese-distsim"
        }
        if (aliases[model] !== undefined)
            model = aliases[model]
        if (!path.isAbsolute(model)) {
            model = path.join(__dirname, "stanford-postagger.d", "models", `${model}.tagger`)
            if (!await fs.exists(model))
                throw new Error(`no such model "${model}"`)
        }

        /*  spawn the Stanford PoS-Tagger process  */
        this.emit("postagger-start")
        this.emit("debug", "postagger: starting")
        this.proc = execa(javaBinary, [
            ...this.options.javaOptions.split(/\s+/),
            "-cp", `${this.options.tagger}:`,
            "edu.stanford.nlp.tagger.maxent.MaxentTagger",
            "-model", model
        ], { stdio: [ "pipe", "pipe", "pipe" ] })

        /*  detect shutdown of Stanford PoS-Tagger process  */
        this.proc.on("close", (code) => {
            this.emit("postagger-close", code)
            this.emit("debug", `postagger: close (code: ${code})`)
            this.proc = null
        })

        /*  receive data on stdout from Stanford PoS-Tagger process  */
        this.proc.stdout.on("data", (chunk) => {
            let data = chunk.toString()
            data = data.replace(/\r?\n/g, " ").replace(/^\s+/, "").replace(/\s+$/, "")
            this.emit("postagger-stdout", data)
            this.emit("debug", `postagger: stdout: "${data}"`)
            this.queueIn.push(data)
            if (this.queueOut.length > 0) {
                data = this.queueIn.shift()
                let resolve = this.queueOut.shift()
                resolve(data)
            }
        })

        /*  pass-through stderr of Stanford PoS-Tagger process
            and detect when it is finall ready to service requests  */
        return new Promise((resolve, reject) => {
            this.proc.stderr.on("data", (chunk) => {
                let data = chunk.toString()
                data = data.replace(/\r?\n/g, " ").replace(/^\s+/, "").replace(/\s+$/, "")
                this.emit("postagger-stderr", data)
                this.emit("debug", `postagger: stderr: "${data}"`)
                if (data.match(/Type\s+some\s+text\s+to\s+tag/)) {
                    this.emit("postagger-started")
                    this.emit("debug", "postagger: started")
                    resolve()
                }
            })
        })
    }

    /*  query the Stanford PoS-Tagger service  */
    async tag (text) {
        /*  sanity check usage  */
        if (this.proc === null)
            throw new Error("Stanford PoS-Tagger process not running")

        /*  send text to tag to Stanford PoS-Tagger process  */
        text = text.replace(/\r?\n/g, " ").replace(/^\s+/, "").replace(/\s+$/, "")
        this.emit("postagger-stdin", text)
        this.emit("debug", `postagger: stdin: "${text}"`)
        this.proc.stdin.write(`${text}\n`)

        /*  provide a promise for delivering the result  */
        return new Promise((resolve, reject) => {
            this.queueOut.push(resolve)
        })
    }

    /*  stop the Stanford PoS-Tagger service  */
    async stop () {
        /*  sanity check usage  */
        if (this.proc === null)
            throw new Error("Stanford PoS-Tagger process not running")

        /*  send process termination signal and await its shutdown  */
        this.emit("postagger-stop")
        this.emit("debug", "postagger: stopping")
        return new Promise((resolve, reject) => {
            this.proc.on("close", (code) => {
                this.emit("postagger-stopped")
                this.emit("debug", "postagger: stopped")
                resolve()
            })
            this.proc.stdin.end()
        })
    }
}

/*  export API class  */
module.exports = PoSTagger

