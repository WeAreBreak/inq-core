/**
 * Created by schwarzkopfb on 14/08/12.
 */

/*
 * include
 */

var assert     = require('assert'),
    InqPromise = require('./InqPromise')

require('./Array')
require('./Function')
require('./Iterator')

/*
 * factory
 */

/**
 * Accepts a generator function and wraps it into an InqPromise object
 * that will be resolved if the iteration has been finished or an error occurs.
 *
 * @param fn {function*} The generator function to iterate on.
 * @param [done] {function(err,res)} An optional callback that will be called immediately if the promise resolves.
 * @returns {InqPromise}
 */
function inq(fn, done) {
    assert(fn instanceof Function, 'Invalid argument provided for $(fn[, done])')

    var instance = new InqPromise(fn, this)

    if(arguments.length > 1) {
        assert(done instanceof Function, 'Invalid arguments provided for $(fn[, done])')

        instance.done(done)
    }

    return instance
}

inq.Promise = InqPromise

/*
 * methods
 */

/**
 * Creates an awaitable task that will be finished with empty result after the given delay.
 *
 * @param delay {number} The delay in milliseconds.
 * @returns {Function}
 */
function wait(delay) {
    return function (callback) {
        setTimeout(callback, delay)
    }
}

// aliases
inq.wait = inq.after = inq.delay = inq.timeout = wait

/**
 * Executes all the tasks in the given object in series and returns it.
 *
 * @param value {*} Any value or object to be executed.
 * @returns {Iterator}
 */
function* series(value) {
    if(value instanceof Function)
        return value
    if(value instanceof Object) {
        var result = Array.isArray(value) ? [] : {}

        for (var key in value)
            result[key] = yield value[key]

        return result
    }
    else
        return value
}

inq.series = series

/**
 * Relinquish inq's control of the $ global variable and also the Object.prototype.$, the Array.prototype.$ & the Function.prototype.$ getters.
 */
function noConflict() {
    affected.forEach(function (obj, i) {
        obj.$ = before[i]
    })
}

var affected = [ global, Array.prototype, Function.prototype, Object.prototype ],
    before   = affected.map(function (obj) { return obj.$ })

inq.noConflict = noConflict

/*
 * expose
 */

global.inq = global.$ = module.exports = inq