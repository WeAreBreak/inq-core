/**
 * Created by schwarzkopfb on 14/08/12.
 */

function noop() {}

var EventEmitter = require('events').EventEmitter

function InqPromise(executor, context) {
    EventEmitter.call(this)

    var self = this, _err, _res

    this.state = 'pending'

    this.done = function (callback) {
        if(~[ 'rejected', 'fulfilled' ].indexOf(self.state))
            callback(_err, _res)
        else
            self.once('done', callback).once('error', noop)
    }

    this.success = function (callback) {
        if(self.state === 'fulfilled')
            callback(_res)
        else
            self.once('fulfilled', callback)
    }

    this.fail = function (callback) {
        if(self.state === 'rejected')
            callback(_err)
        else
            self.once('error', callback)
    }

    function done(err, res) {
        if(err) {
            self.state = 'rejected'
            self.emit('error', Error(err))
        }
        else {
            self.state = 'fulfilled'
            self.emit('fulfilled', res)
        }

        self.emit('done', err, res)
    }

    var iterator, item, value

    try {
        var iterator = !Object.isIterator(executor) ? executor.call(context) : executor
    }
    catch(ex) {
        return end(ex)
    }

    function end(err, result) {
        _err = err
        _res = result

        setImmediate(done.bind(context, err, result))
    }

    function next(err, result) {
        item  = iterator.next(result)
        value = item.value

        if(err)
            return end(err)
        else if(item.done)
            return end(null, value || result)
        else if(value instanceof Function) {
            if(Function.isGenerator(value))
                value = (new InqPromise(value, context)).done
        }
        else if(value instanceof Object) {
            if(Object.isIterator(value))
//                value = (new InqPromise(value, context)).done
                throw new Error('You connot yield iterators directly. Use yield* instead to await other async tasks (in parctice generator functions).')
            else
                value = awaitObject(value, value.limit_)
        }
        else {
            return setImmediate(next.bind(0, null, value))
        }

        try {
            setImmediate(
                value.bind(context, function () {
                    next.apply(0, arguments)
                })
            )
        }
        catch(ex) { end(ex) }
    }

    next()
}

require('util').inherits(InqPromise, EventEmitter)

function awaitObject(obj, limit) {
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

var done    = { value: function () { this.done.apply(this, arguments) } },
    success = { value: function () { this.success.apply(this, arguments) } },
    fail    = { value: function () { this.fail.apply(this, arguments) } }

Object.defineProperties(InqPromise.prototype, {
    complete:   done,
    completed:  done,
    successful: success,
    fulfilled:  success,
    failed:     fail,
    error:      fail,
    rejected:   fail
})

/*
 * expose
 */

module.exports = InqPromise