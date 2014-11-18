/**
 * Created by schwarzkopfb on 14/08/12.
 */

function noop() {}

var EventEmitter = require('events').EventEmitter

function InqPromise(executor, context) {
    EventEmitter.call(this)

    var iterator, result

    var self    = this,
        state   = 0,
        started = false

    Object.defineProperties(this, {
        result: {
            enumerable: true,
            get: function () { return result }
        },

        _result: {
            set: function (value) {
                if (state === 0)
                    result = value
            }
        },

        state: {
            enumerable: true,
            get: function () { return InqPromise.state[state] }
        },

        _state: {
            get: function () { return state },
            set: function (value) {
                if (state === 0 && state in InqPromise.state)
                    state = value
            }
        },

        _started: {
            get: function () { return started },
            set: function () { started = true }
        },

        _iterator: {
            get: function () { return iterator }
        }
    })

    try {
        iterator = !Object.isIterator(executor) ? executor.call(context || this) : executor
        this._execute(context)
    }
    catch(ex) {
        this.reject(ex)
    }
}

require('util').inherits(InqPromise, EventEmitter)

/*
 * utilities
 */

function notConfigurable() {
    throw new Error('You cannot override InqPromise instance members.')
}

function define(names, value, target) {
    var descriptor = {}

    for(var key in names)
        descriptor[names[key]] = { get: function () { return value }, set: notConfigurable }

    Object.defineProperties(target || InqPromise.prototype, descriptor)
}

/*
 * possible promise states
 */

define([ 'state' ], [ 'pending', 'fulfilled', 'rejected', 'aborted' ], InqPromise)

/*
 * promise completed
 */

function completed(callback) {
    var state = this._state

    if(state === 1)
        callback(null, this.result)
    else if(state === 2)
        callback(this.result)
    else
        this.once('done', callback).once('error', noop)

    return this
}

define([ 'completed', 'complete', 'done' ], completed)

/*
 * promise .then (Promises/A)
 */

function then(onFulfilled, onRejected) {
    var state = this._state

    if(state === 1)
        onFulfilled(this.result)
    else if(state === 2)
        onRejected(this.result)
    else {
        this.once('fulfilled', onFulfilled)

        if(arguments.length > 1)
            this.once('error', onRejected)
    }

    return this
}

define([ 'then' ], then)

/*
 * promise fulfilled
 */

function fulfilled(callback) {
    if(this._state === 1)
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
    if(this._state === 2)
        callback(this.result)
    else
        this.once('error', callback)

    return this
}

define([ 'rejected', 'error', 'failed', 'fail', 'catch' ], rejected)

/*
 * reject promise
 */

function reject(error) {
    if(this._state !== 0) return;

    error instanceof Error || (error = new Error(error))

    this._result = error
    this._state = 2
    this.emit('rejected', error)
    this.emit('done', error)
    this.emit('error', error)

    return this
}

define([ 'reject' ], reject)

/*
 * resolve promise
 */

function resolve(result) {
    if(this._state !== 0) return;

    this._result = result
    this._state = 1
    this.emit('done', null, result)
    this.emit('fulfilled', result)

    return this
}

define([ 'resolve' ], resolve)

/*
 * abort execution
 */

function abort(reason) {
    if(this._state !== 0) return;

    this._result = reason
    this._state = 3
    this.emit('aborted', reason)

    return this
}

define([ 'terminate', 'abort', 'stop', 'cancel' ], abort)

/*
 * execute iteration
 */

function execute(context) {
    if(this._started)
        return
    else
        this._started = true

    var item, value

    var self     = this,
        iterator = this._iterator

    function next(error, result) {
        if(self._state !== 0) return;

        if(error)
            return self.reject(error)
        else {
            try {
                item  = iterator.next(result)
                value = item.value
            }
            catch(ex) {
                return self.reject(ex)
            }
        }

        if(item.done)
            return self.resolve(value || result)
        else if(value instanceof Function) {
            if(Function.isGenerator(value))
                value = (new InqPromise(value, context)).done
        }
        else if(value instanceof Object) {
            if(value.then instanceof Function)
                value = value.then.bind(value).inq.wrap(0, 1)
            else if(Object.isIterator(value))
                throw new Error('You cannot yield iterators directly. Use yield* fn() or yield inq.delegated(fn()) instead to await generator functions.')
            else
                value = processObject(value, value.concurrent_)
        }
        else
            return setImmediate(next.bind(0, null, value))

        value.call(context, function () {
            var args = arguments

            setImmediate(function () {
                next.apply(0, args)
            })
        })
    }

    if(this._state === 0) next()
}

define([ '_execute' ], execute)

/**
 *
 *
 * @param obj
 * @param concurrent
 * @returns {Function}
 */
function processObject(obj, concurrent) {
    delete obj.concurrent_

    concurrent = concurrent > 0 && concurrent || Infinity

    var result  = Array.isArray(obj) ? [] : {},
        keys    = Object.keys(obj),
        active  = 0,
        pending = keys.length

    var finished, finish, key, val

    function done(err, res) {
        if(finished) return

        if(!err) {
            result[this] = res
            active--

            if(--pending)
                next()
            else
                finish(null, result)
        }
        else {
            finished = true
            finish(err)
        }
    }

    function next() {
        while(pending && active < concurrent && (key = keys.shift())) {
            active++

            val = obj[key]

            if (val instanceof Function)
                val(done.bind(key))
            if (val.then instanceof Function)
                val.then.bind(val).inq.wrap(0, 1)(done.bind(key))
            else
                done.call(key, null, val)
        }
    }

    return function (callback) {
        finish = callback || noop

        if(!pending)
            finish(null, obj)
        else
            next()
    }
}

/*
 * expose
 */

module.exports = InqPromise