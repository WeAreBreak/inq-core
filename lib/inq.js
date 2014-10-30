/**
 * Created by schwarzkopfb on 14/08/12.
 */

/*
 * variables
 */

var affected = [ Array.prototype, Object.prototype, Function.prototype ],
    before   = [ global.$ ].concat(affected.map(function (obj) { return obj.$ }))

/*
 * include
 */

require('./Array')
require('./Function')
require('./Iterator')

var assert     = require('assert'),
    InqPromise = require('./InqPromise')

/*
 * utilities
 */

function notConfigurable() {
    throw new Error('You cannot override inq core construcotrs.')
}

function define(names, value) {
    var descriptor = {}

    for(var key in names)
        descriptor[names[key]] = { get: function () { return value }, set: notConfigurable }

    Object.defineProperties(inq, descriptor)
}

/*
 * factory
 */

/**
 * TODO: (fn[, ctx][, done])
 *
 * Accepts a generator function and wraps it into an InqPromise object
 * that will be resolved if the iteration has been finished or an error occured.
 *
 * @param fn {function*} The generator function to iterate on.
 * @param [done] {function(err,res)} An optional callback that will be called immediately if the promise resolves.
 * @returns {InqPromise}
 */
function inq(fn, done) {
    assert(fn instanceof Function, 'Invalid argument provided for $(fn[, done])')

    var instance = new InqPromise(fn/*, this*/)

    if(arguments.length > 1) {
        assert(done instanceof Function, 'Invalid arguments provided for $(fn[, done])')

        instance.done(done)
    }

    return instance
}

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

define([ 'wait', 'after', 'delay', 'timeout' ], wait)

/**
 * Evaluates all the tasks in the given object in series and returns it.
 *
 * @param value {*} Any value or object to be executed.
 * @returns {Iterator}
 */
function* series(value) {
    if(value instanceof Function) {
        if(Function.isGenerator(value))
            return yield* value()
        else
            return yield value
    }
    if(value instanceof Object) {
        var result = Array.isArray(value) ? [] : {}

        for (var key in value)
            result[key] = yield value[key]

        return result
    }
    else
        return value
}

define([ 'series' ], series)

/**
 * TODO: document it!
 *
 * @param obj {object}
 * @returns {object}
 */
function bound(obj) {
    for(var key in obj)
        if(obj[key] instanceof Function)
            obj[key] = obj[key].bind(obj);

    // Promise's .then method isn't enumerable
    if(obj.then instanceof Function)
        obj.then = obj.then.bind(obj)

    return obj;
}

define([ 'bound' ], bound)

function* delegated(value) {
    if(Object.isIterator(value))
        return yield* value
    else
        return value
}

define([ 'delegated' ], delegated)

/**
 * Relinquish inq's control of the $ global variable and also the Array.prototype.$ & the Function.prototype.$ getters.
 */
function noConflict() {
    global.$ = before.shift()
    affected.forEach(function (obj, i) {
        delete obj.$
        obj.$ = before[i]
    })
}

define([ 'noConflict' ], noConflict)

/*
 * expose
 */

global.inq = global.$ = module.exports = inq