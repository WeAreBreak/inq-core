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
        iterator = !Object.isIterator(executor) ? executor.call(context) : executor
        this._execute(context)
    }
    catch(ex) {
        this.reject(ex)
    }
}

require('util').inherits(InqPromise, EventEmitter)

/*
 * possible promise states
 */

InqPromise.state = [ 'pending', 'fulfilled', 'rejected' ]

/*
 * promise completed
 */

function completed(callback) {
    var state = this._state

    if(state === 1 || state === 2)
        callback(this.result, this.result)
    else
        this.once('done', callback).once('error', noop)
}

/*
 * promise fulfilled
 */

InqPromise.prototype.completed = InqPromise.prototype.complete = InqPromise.prototype.done = completed

function fulfilled(callback) {
    if(this._state === 1)
        callback(this.result)
    else
        this.once('fulfilled', callback)
}

InqPromise.prototype.fulfilled = InqPromise.prototype.successful = InqPromise.prototype.success = fulfilled

/*
 * promise rejected
 */

function rejected(callback) {
    if(this._state === 2)
        callback(this.result)
    else
        this.once('error', callback)
}

InqPromise.prototype.rejected = InqPromise.prototype.error = InqPromise.prototype.failed = InqPromise.prototype.fail = rejected

/*
 * reject promise
 */

function reject(error) {
    this.result = error
    this._state = 2
    this.emit('done',  error)
    this.emit('error', error)
}

InqPromise.prototype.reject = reject

/*
 * resolve promise
 */

function resolve(result) {
    this.result = result
    this._state = 1
    this.emit('done', null, result)
    this.emit('fulfilled', result)
}

InqPromise.prototype.resolve = resolve

/*
 * execute iteration
 */

function execute(context) {
    if(this._started)
        return;
    else
        this._started = true

    var item, value

    var self     = this,
        iterator = this._iterator

    function next(err, result) {
        item  = iterator.next(result)
        value = item.value

        if(err)
            return self.reject(error)
        else if(item.done)
            return self.resolve(value || result)
        else if(value instanceof Function) {
            if(Function.isGenerator(value))
                value = (new InqPromise(value, context)).done
        }
        else if(value instanceof Object) {
            if(Object.isIterator(value))
                throw new Error('You connot yield iterators directly. Use yield* instead to await generator functions.')
            else
                value = processObject(value, value.limit_)
        }
        else
            return setImmediate(next.bind(0, null, value))

        try {
            setImmediate(
                value.bind(context, function () {
                    next.apply(0, arguments)
                })
            )
        }
        catch(ex) {
            self.reject(ex)
        }
    }

    next()
}

InqPromise.prototype._execute = execute

function processObject(obj, limit) {
    delete obj.limit_

    limit = limit > 0 && limit || Infinity

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
        while(pending && active < limit && (key = keys.shift())) {
            active++

            val = obj[key]

            if (val instanceof Function)
                val(done.bind(key))
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