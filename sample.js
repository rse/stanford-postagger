
;(async () => {

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

