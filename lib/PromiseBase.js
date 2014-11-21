/**
 * Created by schwarzkopfb on 14/11/20.
 */

var EventEmitter = require('events').EventEmitter

function InqPromiseBase() {
    EventEmitter.call(this)

    var result, state = 0

    Object.defineProperties(this, {
        result: {
            enumerable: true,
            get: function () { return result }
        },

        _result: {
            set: function (value) {
                if (state === 1)
                    result = value
            }
        },

        state: {
            enumerable: true,
            get: function () { return InqPromiseBase.state[state] }
        },

        _state: {
            get: function () { return state },
            set: function (value) {
                if (state in InqPromiseBase.state)
                    state = value
            }
        }
    })
}

require('util').inherits(InqPromiseBase, EventEmitter)

/*
 * utilities
 */

function noop() {}

var define = require('./define')(InqPromiseBase.prototype)

/*
 * possible promise states
 */

define('state', [ 'pending', 'running', 'fulfilled', 'rejected', 'aborted' ], InqPromiseBase)

/*
 * promise completed
 */

function completed(callback) {
    var state = this._state

    if(state === 2)
        callback(null, this.result)
    else if(state === 3)
        callback(this.result)
    else
        this.once('done', callback).once('error', noop)

    return this
}

define([ 'done', 'completed', 'complete' ], completed)

/*
 * promise .then (Promises/A)
 */

function then(onFulfilled, onRejected) {
    var state = this._state

    if(state === 2)
        onFulfilled(this.result)
    else if(state === 3)
        onRejected(this.result)
    else {
        this.once('fulfilled', onFulfilled)

        if(arguments.length > 1)
            this.once('error', onRejected)
    }

    return this
}

define('then', then)

/*
 * promise fulfilled
 */

function fulfilled(callback) {
    if(this._state === 2)
        callback(this.result)
    else
        this.once('fulfilled', callback)

    return this
}

define([ 'fulfilled', 'resolved', 'successful', 'success' ], fulfilled)

/*
 * promise rejected
 */

function rejected(callback) {
    if(this._state === 3)
        callback(this.result)
    else
        this.once('error', callback)

    return this
}

define([ 'catch', 'rejected', 'error', 'failed', 'fail' ], rejected)

/*
 * reject promise
 */

function reject(error) {
    if(this._state !== 1) return

    error instanceof Error || (error = new Error(error))

    this._result = error
    this._state  = 3

    this.emit('rejected', error)
    this.emit('done',     error)
    this.emit('error',    error)

    return this
}

define('reject', reject)

/*
 * resolve promise
 */

function resolve(result) {
    if(this._state !== 1) return

    this._result = result
    this._state  = 2

    this.emit('done', null, result)
    this.emit('fulfilled', result)

    return this
}

define('resolve', resolve)

/*
 * abort execution
 */

function abort(reason) {
    if(this._state !== 1) return

    this._result = reason
    this._state  = 4

    this.emit('aborted', reason)

    return this
}

define([ 'abort', 'terminate', 'stop', 'cancel' ], abort)

module.exports = InqPromiseBase