/**
 * Created by schwarzkopfb on 14/10/16.
 */

const N = +process.argv.slice(2)[0]

require('../lib/inq')

var start, data = { text: 'awaited and then returned. yay!' }

function now(label) {
    var stamp = 0

    if(start)
        stamp = (+new Date - start)
    else
        start = +new Date

    console.log(':' + label, stamp)
}

function test(value, callback) {
    setTimeout(callback.bind(0, null, value), 500)
}

$(
    function* () {
        now('start')

        switch(N) {
            case 1:
            default:
                return (yield test.$(data)).text

            case 2:
                return yield test.$(data)

            case 3:
                yield test.$(data)
                return 'haha, text is lost but awaited!'

            case 4:
                return test.$(data) // nothing was awaited for! :(
        }
    },

    function done(err, res) {
        now('done')

        console.log(err || res)
        console.log('OK')
    }
)