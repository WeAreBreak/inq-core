/**
 * Created by schwarzkopfb on 14/11/1.
 */

require('../')

function onAborted(reason) {
    console.log('aborted because', reason)
}

function onComplete(err, res) {
    console.log('done', err, res)
}

function* main() {
    console.log('start')

    for(var i = 0; i < 10; i++) {
        console.log('item #' + (i + 1))
        yield $.wait(1000)
    }

    console.log('end')
}

var ip = $(main).on('aborted', onAborted).complete(onComplete)

setTimeout(function () {
    ip.abort()
}, 3000)