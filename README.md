
Stanford-PoSTagger
==================

[Stanford Log-Linear Part-Of-Speech (PoS) Tagger](https://nlp.stanford.edu/software/tagger.shtml) for Node.js

<p/>
<img src="https://nodei.co/npm/stanford-postagger.png?downloads=true&stars=true" alt=""/>

<p/>
<img src="https://david-dm.org/rse/stanford-postagger.png" alt=""/>

About
-----

This is a small JavaScript library for use in Node.js environments,
providing the possibility to run the
[Stanford Log-Linear Part-Of-Speech (PoS) Tagger](https://nlp.stanford.edu/software/tagger.shtml)
as a local background process and query it with a frontend JavaScript API.
Use this for tagging the words of English, German, French, Spanish, Arabic and Chinese
texts with PoS tags.

NOTICE
------

The Stanford PoS-Tagger is licensed under
[GNU General Public License](https://www.gnu.org/licenses/gpl-2.0.html) and is not part
of this module. It is 128 MB in size and ships with 21 models. It is automatically downloaded from
its external origin on `npm install`. Applications using this Node.js
module have to take the license of Stanford PoS-Tagger into account.
The module [pos](https://npmjs.com/pos) (LGPL licensed, English only)
the module [en-pos](https://npmjs.com/en-pos) (MIT licensed, English only),
the module [wink-pos-tagger](https://npmjs.com/wink-pos-tagger) (AGPL licensed, English only),
the module [compromise](http://compromise.cool) (MIT licensed, English only),
and the module [kompromiss](https://npmjs.com/kompromiss) (MIT licensed, German only)
are decent alternatives.

Models
------

This package includes the following upstream Stanford PoS-Tagger models:

Model Id                                | Language | PoS Tags             | Alias Id
----------------------------------------|----------|----------------------|----------
`english-left3words-distsim`            | English  | Penn Treebank        | `english`
`english-caseless-left3words-distsim`   | English  | Penn Treebank        |
`english-bidirectional-distsim`         | English  | Penn Treebank        |
`wsj-0-18-left3words-distsim`           | English  | Penn Treebank        | `english-alt`
`wsj-0-18-left3words-nodistsim`         | English  | Penn Treebank        |
`wsj-0-18-caseless-left3words-distsim`  | English  | Penn Treebank        |
`wsj-0-18-bidirectional-distsim`        | English  | Penn Treebank        |
`wsj-0-18-bidirectional-nodistsim`      | English  | Penn Treebank        |
`german-hgc`                            | German   | STTS Treebank        | `german`
`german-ud`                             | German   | STTS Treebank        |
`german-fast`                           | German   | STTS Treebank        |
`german-fast-caseless`                  | German   | STTS Treebank        |
`french`                                | French   | French Treebank      | `french`
`french-ud`                             | French   | French Treebank      |
`spanish`                               | Spanish  | Spanish Treebank     | `spanish`
`spanish-distsim`                       | Spanish  | Spanish Treebank     |
`spanish-ud`                            | Spanish  | Spanish Treebank     |
`arabic`                                | Arabic   | Bies Tags            | `arabic`
`arabic-train`                          | Arabic   | Bies Tags            |
`chinese-distsim`                       | Chinese  | LDC Chinese Treebank | `chinese`
`chinese-nodistsim`                     | Chinese  | LDC Chinese Treebank |

For English we recommend the `english-left3words-distsim` (aliased as `english`) model or
alternatively the `wsj-0-18-left3words-distsim` (aliased as `english-alt`) model (both with the
[Penn Treebank PoS tags](http://www.ling.upenn.edu/courses/Fall_2003/ling001/penn_treebank_pos.html)).
For German we recommend the `german-ghc` (aliased `german`) model (with the
[STTS Treebank PoS tags](https://www.linguistik.hu-berlin.de/de/institut/professuren/korpuslinguistik/mitarbeiter-innen/hagen/STTS_Tagset_Tiger)).

Installation
------------

```shell
$ npm install stanford-postagger
```

Usage
-----

```js
(async () => {
    const POS = require(".")
    const pos = new POS()
    await pos.start()
    await pos.tag("The Stanford PoS-Tagger is a great piece of software!").then((data) => {
        console.log(data)
    })
    await pos.stop()
})().catch((err) => {
    console.log(`ERROR: ${err}`)
})
```

Output:

```
The_DT Stanford_NNP PoS-Tagger_NNP is_VBZ a_DT great_JJ piece_NN of_IN software_NN !_.
```

Application Programming Interface
---------------------------------

```ts
declare class TikaServer {
    constructor(options?: {
        javaBinary?: string   /* default: "java" */
        javaOptions?: string  /* default: "-server -Xms1G -Xmx1G" */
        tagger?:string        /* default: "${__dirname}/stanford-postagger.d/stanford-postagger.jar" */
        model?: string        /* default: "wsj-0-18-left3words-distsim" */
    })

    public on(
        event: string,
        callback: (event: any) => void
    ): void

    public start(
    ): Promise<void>

    public tag(
        text: string,
    ): Promise<string>

    public stop(
    ): Promise<void>
}
```

Motivation
----------

The major differences of [stanford-postagger](http://npmjs.com/stanford-postagger)
to similar NPM modules and the motivation for the existence of
[stanford-postagger](http://npmjs.com/stanford-postagger) are:

1. [stanford-postagger](http://npmjs.com/stanford-postagger),
   in contrast to the [node-stanford-postagger](http://npmjs.com/node-stanford-postagger) module,
   does not depend on Docker or XML-RPC.
   Instead, it just requires the `java` executable and speak over stdin/stdout to the Stanford PoS-Tagger process.

2. [stanford-postagger](http://npmjs.com/stanford-postagger),
   in contrast to other scripting approaches, does not
   spawn Stanford PoS-Tagger process for every query.
   Instead, it uses a continuously running background process.

3. [stanford-postagger](http://npmjs.com/stanford-postagger),
   in contrast to other approaches, does not
   need a pre-installed Stanford PoS-Tagger.
   Instead, it automatically downloads and locally installs the Stanford
   PoS-Tagger distribution on `npm install`.

License
-------

Copyright (c) 2018 Ralf S. Engelschall (http://engelschall.com/)

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be included
in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

