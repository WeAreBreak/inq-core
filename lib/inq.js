/**
 * Created by schwarzkopfb on 14/08/12.
 */

/*
 * include
 */

var assert     = require('assert'),
    InqPromise = require('./InqPromise')

require('./Array.inq')
require('./Function.inq')
require('./Object.inq')

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
 * Relinquish inq's control of the $ global variable.
 */
function noConflict() {
    global.$ = before
}

inq.noConflict = noConflict

/**
 * Relinquish inq's control of the $ global variable and also the Array.prototype.$ & Function.prototype.$ getters.
 */
function noConflictAll() {
    noConflict()
    Array.$.noConflict()
    Function.$.noConflict()
//    Object.$.noConflict()
}

inq.noConflictAll = noConflictAll

/*
 * expose
 */

var before = global.$

global.inq = global.$ = module.exports = inq