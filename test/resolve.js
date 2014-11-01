/**
 * Created by schwarzkopfb on 14/11/1.
 */

require('../')

function* test(num) {
    yield 9
    return num
}

$(function* () {
    yield test.$(42)
}).done(function () {
    console.log('DONE', arguments);
})