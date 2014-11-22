/**
 * Created by schwarzkopfb on 14/08/12.
 */

var InqPromiseBase = require('./PromiseBase')

function InqPromise(executor, context) {
    InqPromiseBase.call(this)

    Object.defineProperties(this, {
        _iterator: {
            get: function () { return iterator }
        }
    })

    try {
        var iterator = !Object.isIterator(executor) ? executor.call(context || this) : executor
        this._execute(context)
    }
    catch(ex) {
        this.reject(ex)
    }
}

require('util').inherits(InqPromise, InqPromiseBase)

/*
 * utilities
 */

function noop() {}

var define = require('./define')(InqPromise.prototype)

/*
 * execute iteration
 */

function execute(context) {
    if(this._state === 0) {
        var item, value

        var self     = this,
            iterator = this._iterator

        this._state = 1
        next()
    }

    function next(error, result) {
        if(self._state !== 1) return

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
}

define('_execute', execute)

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

            if (val instanceof Function || Object.isIterator(val)) {
                if(Function.isGenerator(val) || Object.isIterator(val))
                    (new InqPromise(val)).done(done.bind(key))
                else
                    val(done.bind(key))
            }
            else if(val instanceof Object && val.then instanceof Function)
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