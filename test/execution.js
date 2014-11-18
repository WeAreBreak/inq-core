/**
 * Created by schwarzkopfb on 14/11/1.
 */

var assert = require('assert')

require('..')

describe('execution', function () {
//    assert($() instanceof inq.Promise)

    it('error in generator', function (done) {
        inq(function* () {
            yield result // result not defined
        }).done(function (err, res) {
            assert(err, 'Errors in generator should be caught')
            done()
        })
    })

    it('async error in generator', function (done) {
        inq(function* () {
            yield inq.wait(5)
            return result // result not defined
        }).done(function (err, res) {
            assert(err, 'Async errors in generator should be caught')
            done()
        })
    })
})