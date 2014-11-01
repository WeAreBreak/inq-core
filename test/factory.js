/**
 * Created by schwarzkopfb on 14/11/1.
 */

var assert = require('assert')

require('..')

function fn() {}

function test1(cb) {
    cb()
}

function test2(text, cb) {
    cb(null, Array.prototype.slice.call(arguments, 0, 1))
}

function test3(text, cb) {
    cb('error')
}

function test4(cb, text) {
    cb(null, text)
}

function test5(text1, cb, text2) {
    cb(null, text1 + text2)
}

function test6(text1, cb, text2) {
    cb(text2)
}

function test7(success, failed) {
    success('success')
}

function test8(success, failed) {
    failed('failed')
}

function test9(failed, text, success) {
    success(text)
}

function test10(failed, text1, success, text2) {
    success(text1 + text2)
}

describe('task', function () {
    it('constructors', function () {
        var t1  = test1.inq(),
            t2  = test2.inq('test2'),
            t3  = test3.inq('test3'),
            t4  = test4.inq.task(0, 'test4'),
            t5  = test5.inq.task(1, 'test', '5'),
            t6  = test6.inq.task(1, true, 'test6'),
            t7  = test7.inq.wrap(0, 1),
            t8  = test8.inq.wrap(0, 1),
            t9a = test9.inq.wrap(2, 0, 'test9a'),
            t9b = test9.inq.wrap(2, 0),
            t10 = test10.inq.wrap(2, 0, 'test', '10')

        assert(t1  instanceof Function, 'task must be a Function')
        assert(t2  instanceof Function, 'task must be a Function')
        assert(t3  instanceof Function, 'task must be a Function')
        assert(t4  instanceof Function, 'task must be a Function')
        assert(t5  instanceof Function, 'task must be a Function')
        assert(t6  instanceof Function, 'task must be a Function')
        assert(t7  instanceof Function, 'task must be a Function')
        assert(t8  instanceof Function, 'task must be a Function')
        assert(t9a instanceof Function, 'task must be a Function')
        assert(t9b instanceof Function, 'task must be a Function')
        assert(t10 instanceof Function, 'task must be a Function')

        assert(t1.length, 2,  'task must accept two parameters')
        assert(t2.length, 2,  'task must accept two parameters')
        assert(t3.length, 2,  'task must accept two parameters')
        assert(t4.length, 2,  'task must accept two parameters')
        assert(t5.length, 2,  'task must accept two parameters')
        assert(t6.length, 2,  'task must accept two parameters')
        assert(t7.length, 2,  'task must accept two parameters')
        assert(t8.length, 2,  'task must accept two parameters')
        assert(t9a.length, 2, 'task must accept two parameters')
        assert(t9b.length, 2, 'task must accept two parameters')
        assert(t10.length, 2, 'task must accept two parameters')
    })

    it('callbacks', function (done) {
        var called = 0

        test1.inq()(function () {
            called++
            assert.equal(arguments.length, 0, 'arguments.length should be 0')
        })

        test2.inq('test2')(function (err, res) {
            called++
            assert.equal(err, null, 'err should be null')
            assert(Array.isArray(res), 'res should be an array')
            assert.equal(res.length, 1, 'res.length should be 1')
            assert.equal(res[0], 'test2', 'res[0] should be "test"')
        })

        test3.inq('test3')(function (err, res) {
            called++
            assert.equal(err, 'error', 'err should be "error"')
        })

        test4.inq.task(0, 'test4')(function (err, res) {
            called++
            assert.equal(err, null, 'err should be null')
            assert.equal(res, 'test4', 'res should be "test4"')
        })

        test5.inq.task(1, 'test', '5')(function (err, res) {
            called++
            assert.equal(err, null, 'err should be null')
            assert.equal(res, 'test5', 'res should be "test5"')
        })

        test6.inq.task(1, true, 'test6')(function (err, res) {
            called++
            assert.equal(err, 'test6', 'err should be "test6"')
            assert.equal(arguments.length, 1, 'test6 should pass back only an error')
        })

        test7.inq.wrap(0, 1)(function (err, res) {
            called++
            assert.equal(res, 'success', 'res should be "success"')
            assert.equal(arguments.length, 2, 'test7 should pass back null as error and "success" as result')
        })

        test8.inq.wrap(0, 1)(function (err, res) {
            called++
            assert.equal(err, 'failed', 'err should be "failed"')
            assert.equal(arguments.length, 1, 'test8 should pass back "failed" as error')
        })

        test9.inq.wrap(2, 0, 'test9a')(function (err, res) {
            called++
            assert.equal(err, null, 'err should be null')
            assert.equal(res, 'test9a', 'res should be "test9"')
            assert.equal(arguments.length, 2, 'test9a should get exactly two arguments')
        })

        test9.inq.wrap(2, 0)(function (err, res) {
            called++
            assert.equal(err, null, 'err should be null')
            assert.equal(res, undefined, 'res should be undefined')
            assert.equal(arguments.length, 2, 'test9b should get exactly two arguments')
        })

        test10.inq.wrap(2, 0, 'test', '10')(function (err, res) {
            called++
            assert.equal(err, null, 'err should be null')
            assert.equal(res, 'test10', 'res should be "test10"')
            assert.equal(arguments.length, 2, 'test10 should get exactly two arguments')
        })

        assert.equal(called, 11, 'all callbacks should be fired exactly once')

        done()
    })

    it('decorator chains on .inq()', function () {
        assert(fn.inq(), '.inq() should be called')
        assert(fn.inq().retry(), '.retry() should be called after .inq()')
        assert(fn.inq().fallback(), '.fallback() should be called after .inq()')
        assert(fn.inq().retry().fallback(), '.retry() & .fallback() should be chained after .inq()')
        assert(fn.inq().repeat(), '.repeat() should be called after .inq()')
        assert(fn.inq().repeat().fallback(), '.repeat() & .fallback() should be chained after .inq()')
        assert(fn.inq().fallback().repeat(), '.fallback() & .repeat() should be chained after .inq()')
        assert(fn.inq().timeout().repeat(), '.timeout() & .repeat() should be chained after .inq()')
        assert(fn.inq().repeat().timeout(), '.repeat() & .timeout() should be chained after .inq()')
        assert(fn.inq().repeat().timeout().fallback(), '.repeat(), .timeout() & .fallback() should be chained after .inq()')
        assert(fn.inq().repeat().timeout().retry().fallback(), '.repeat(), .timeout(), .retry() & .fallback() should be chained after .inq()')
        assert(fn.inq().retry().timeout().repeat().fallback(), '.retry(), .timeout(), .repeat() & .fallback() should be chained after .inq()')

        assert(function () {
            fn.inq().fallback().retry()
        }, /undefined is not a function/, 'retry() shouldn\'t be called after fallback()')
    })

    it('decorator chains on .inq.task()', function () {
        assert(fn.inq.task(0), '.inq() should be called')
        assert(fn.inq.task(0).retry(), '.retry() should be called after .inq()')
        assert(fn.inq.task(0).fallback(), '.fallback() should be called after .inq()')
        assert(fn.inq.task(0).retry().fallback(), '.retry() & .fallback() should be chained after .inq()')
        assert(fn.inq.task(0).repeat(), '.repeat() should be called after .inq()')
        assert(fn.inq.task(0).repeat().fallback(), '.repeat() & .fallback() should be chained after .inq()')
        assert(fn.inq.task(0).fallback().repeat(), '.fallback() & .repeat() should be chained after .inq()')
        assert(fn.inq.task(0).timeout().repeat(), '.timeout() & .repeat() should be chained after .inq()')
        assert(fn.inq.task(0).repeat().timeout(), '.repeat() & .timeout() should be chained after .inq()')
        assert(fn.inq.task(0).repeat().timeout().fallback(), '.repeat(), .timeout() & .fallback() should be chained after .inq()')
        assert(fn.inq.task(0).repeat().timeout().retry().fallback(), '.repeat(), .timeout(), .retry() & .fallback() should be chained after .inq()')
        assert(fn.inq.task(0).retry().timeout().repeat().fallback(), '.retry(), .timeout(), .repeat() & .fallback() should be chained after .inq()')

        assert(function () {
            fn.inq.task().fallback().retry()
        }, /undefined is not a function/, 'retry() shouldn\'t be called after fallback()')
    })

    it('decorator chains on .inq.wrap()', function () {
        assert(fn.inq.wrap(0), '.inq() should be called')
        assert(fn.inq.wrap(0).retry(), '.retry() should be called after .inq()')
        assert(fn.inq.wrap(0).fallback(), '.fallback() should be called after .inq()')
        assert(fn.inq.wrap(0).retry().fallback(), '.retry() & .fallback() should be chained after .inq()')
        assert(fn.inq.wrap(0).repeat(), '.repeat() should be called after .inq()')
        assert(fn.inq.wrap(0).repeat().fallback(), '.repeat() & .fallback() should be chained after .inq()')
        assert(fn.inq.wrap(0).fallback().repeat(), '.fallback() & .repeat() should be chained after .inq()')
        assert(fn.inq.wrap(0).timeout().repeat(), '.timeout() & .repeat() should be chained after .inq()')
        assert(fn.inq.wrap(0).repeat().timeout(), '.repeat() & .timeout() should be chained after .inq()')
        assert(fn.inq.wrap(0).repeat().timeout().fallback(), '.repeat(), .timeout() & .fallback() should be chained after .inq()')
        assert(fn.inq.wrap(0).repeat().timeout().retry().fallback(), '.repeat(), .timeout(), .retry() & .fallback() should be chained after .inq()')
        assert(fn.inq.wrap(0).retry().timeout().repeat().fallback(), '.retry(), .timeout(), .repeat() & .fallback() should be chained after .inq()')

        assert(function () {
            fn.inq.task().fallback().retry()
        }, /undefined is not a function/, 'retry() shouldn\'t be called after fallback()')
    })
})