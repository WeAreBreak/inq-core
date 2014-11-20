/**
 * Created by schwarzkopfb on 14/11/20.
 */

require('..')

var Chain = inq.Chain

var c = new Chain

function value(value, callback) {
    setTimeout(function () {
        callback(null/*'fake'*/, value)
    }, 200)
}

function* Hello(str) {
    return str + 'Hello'
}

c
.add(Hello)
.add(function* (str) {
    return str + (yield value.$(' Inq'))
})
.add(function* (str) {
    return str + (yield value.$('Chain!'))
})
.start('', function (err, res) {
    console.log(err, res)
})