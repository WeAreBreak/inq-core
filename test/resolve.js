/**
 * Created by schwarzkopfb on 14/11/1.
 */

require('../')

function* test(num) {
    yield $.wait(3000)
    console.log('enough')
    return num
}

function* test2() {
    yield $.wait(2000)
    console.log('test2');
}

$(function* () {
    console.log('start')
    yield test2.$().repeatSeries(1000).timeout(2500).fallback()
    console.log('repeat aborted')
    yield test.$(42).fallback(21).timeout(2000).retry(5).timeout(8000, 'No more tries! :(')
    console.log('end')
}).done(function (err, res) {
    console.log('done', err, res)
})