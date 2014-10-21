/**
 * Created by schwarzkopfb on 14/10/15.
 */

var assert     = require('assert'),
    InqPromise = require('./InqPromise')

function isGeneratorFunction(obj) {
    return obj && obj.constructor && obj.constructor.name === 'GeneratorFunction'
}

Function.isGenerator = Function.isGeneratorFunction = isGeneratorFunction

/*
 * task methods & helpers
 */

/**
 * Wraps a task into another one that will attempt to get a successful response from the wrapped task with the given conditions.
 *
 * @param {number|function(i)} [times]
 *  The wrapped task will be executed no more than 'times' times before returning an error.
 *  If 'times' is a function then it will be called with the count of unsuccessful attempts on every retry
 *  to get the remaining attempt count.
 * @param {number|function(i)} [backoff]
 *  Wait 'backoff' milliseconds before the next attempt.
 *  If 'backoff' is a function then it will be called with the count of unsuccessful attempts on every retry
 *  to get the delay before next attempt.
 * @returns {task(done)}
 */
function retry(times, backoff) {
    assert(!arguments.length     || !isNaN(+times)   || times   instanceof Function, 'If provided, first argument of <task>.retry([times][, backoff]) must be a number or function.')
    assert(arguments.length <= 1 || !isNaN(+backoff) || backoff instanceof Function, 'If provided, second argument of <task>.retry([times][, backoff]) must be a number or function.')

    if(!arguments.length)
        times = 1

    if(!(times instanceof Function))
        times = (function (i) { return this - i }).bind(+times)

    if(!(backoff instanceof Function))
        backoff = (function () { return this }).bind(+backoff)

    var fn = this,
        i  = 0

    var again = function(done, recall) {
        if(recall) i = 0

        fn(function (err) {
            if (err) {
                if (Math.max(Math.round(+times(i) || 0), 0))
                    setTimeout(again.bind(0, done), Math.max(Math.round(+backoff(i++) || 0), 0))
                else
                    done(err)
            }
            else
                done.apply(fn, arguments)
        }, true)
    }

    return decorateTask(again, true)
}

function fallback(value) {
    var fn = this

    return decorateTaskWithRepeat(function(done, recall) {
        fn(function (err, res) {
            if (err)
                done(null, value)
            else
                done(null, res)
        }, recall)
    })
}

function repeat(times) {
    var fn     = this,
        result = [],
        i      = 0

    return decorateTask(function (done, recall) {
        if(recall) {
            result = []
            i      = 0
        }

        function next(err, res) {
            if(err)
                done(err)
            else {
                result.push(res)

                if(++i < times)
                    fn(next, true)
                else
                    done(null, result)
            }
        }

        fn(next, true)
    }, true)
}

function decorateTaskWithRepeat(t) {
    Object.defineProperty(t, 'repeat', { get: function () { return repeat.bind(t) } })
    return t
}

function decorateTask(t, withRepeat) {
    Object.defineProperties(t, {
        retry:    { get: function () { return retry.bind(t) } },
        fallback: { get: function () { return fallback.bind(t) } }
    })

    return withRepeat ? decorateTaskWithRepeat(t) : t
}

/*
 * task factories
 */

function wrap(successPos, errorPos) {
    assert(errorPos !== successPos, 'You cannot provide error and success callbacks at the same position.')

    var args = Array.prototype.slice.call(arguments, 2),
        fn   = this

    return decorateTask(function (done, recall) {
        var called

        function error(err) {
            if (!called && (called = true) || recall)
                done(err)
        }

        function success(res) {
            if (!called && (called = true) || recall)
                done(null, res)
        }

        if(errorPos < successPos) {
            args.splice(errorPos, 0, error)
            args.splice(successPos, 0, success)
        }
        else {
            args.splice(successPos, 0, success)
            args.splice(errorPos, 0, error)
        }

        try {
            fn.apply(fn, args)
        }
        catch(ex) {
            done(ex)
        }
    }, true)
}

function task(donePos) {
    var args = Array.prototype.slice.call(arguments, 1),
        fn   = this

    return decorateTask(function (done, recall) {
        var called

        args.splice(donePos, 0, function () {
            if (!called && (called = true) || recall)
                done.apply(fn, arguments)
        })

        try {
            fn.apply(fn, args)
        }
        catch(ex) {
            done(ex)
        }
    }, true)
}

function basic() {
    var args = Array.prototype.slice.call(arguments),
        fn  = this

    return decorateTask(function (done, recall) {
        var called

        args.push(function() {
            if (!called && (called = true) || recall)
                done.apply(fn, arguments)
        })

        try {
            fn.apply(fn, args)
        }
        catch (ex) {
            done(ex)
        }
    }, true)
}

/*
 * getters & getter helpers
 */

function decorate(t, fn) {
    Object.defineProperties(t, {
        task: { get: function () { return task.bind(fn) } },
        wrap: { get: function () { return wrap.bind(fn) } }
    })

    return t
}

function getTask() {
    var fn = this

    if(Function.isGenerator(fn))
        return function () {
            var args = Array.prototype.slice.call(arguments),
                ctx  = this

            return function (callback) {
                (new InqPromise(fn(args, ctx))).done(callback)
            }
        }
    else
        return decorate(basic.bind(fn), fn)
}

Object.defineProperties(Function.prototype, {
    inq: { get: getTask },

    $: {
        configurable: true,
        get: getTask
    }
})