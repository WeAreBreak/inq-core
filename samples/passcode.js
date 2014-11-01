/**
 * Created by schwarzkopfb on 14/11/1.
 */

require('../')

function passcode() {
    var i = 0, time = 1250, steps = 9

    this.next = function () {
        var over = !(i - steps)

        return {
            value: !over ? function (done) {
                process.stdout.write('\r' + ++i * 10 + '%')

                setTimeout(function () {
                    done(null, !(i - steps) ? i : i == 1 ? i : '*')
                }, time / i ) } : i,

            done: over
        }
    }
}

$(function* () {
    var decoded = '\r'

    for(char of new passcode)
        decoded += yield char

    return decoded
}).fulfilled($.bound(console.log))