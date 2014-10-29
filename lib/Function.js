/**
 * Created by schwarzkopfb on 14/10/15.
 *
 * @todo
 * * ensure recall prevention in all the task factory functions in this file
 */

/*
 * include
 */

var assert     = require('assert'),
    InqPromise = require('./InqPromise')

/*
 * utils
 */

function isGeneratorFunction(obj) {
    return obj && obj.constructor && obj.constructor.name === 'GeneratorFunction'
}

Function.isGenerator = Function.isGeneratorFunction = isGeneratorFunction

/*
 * task factories
 */

/**
 * Wraps a task into another one that will attempt to get a successful response from the wrapt task with the given conditions.
 *
 * @param {number|function(i)} [times]
 *  Wrapt task will be executed no more than 'times' times before returning an error.
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

function repeat(times) {
    if(!arguments.length || times instanceof Function)
        return repeatSeries.apply(this, arguments)
    else {
        assert(!isNaN(+times), 'If provided, first argument of <task>.repeat([times]) must be a number or function.')

        var fn = this

        return decorateTask(function (done, recall) {
            var result = [], finished

            function next(err, res) {
                if (finished) return

                if (!err) {
                    result.push(res)

                    if (result.length >= times) {
                        finished = true
                        done(null, result)
                    }
                }
                else {
                    finished = true
                    done(err)
                }
            }

            for(var i = 0; i <= times; i++)
                fn(next, true)
        }, true)
    }
}

/**
 * Wraps a task into another one that will execute the wrapt task repeadedly in series with given conditions and collects results into a new array.
 *
 * @param {number|function(i,res)} [times]
 *  Wrapt task will be executed 'times' times before returning the results if no error occurs.
 *  If 'times' is a function then it will be called with the count of repeats and the result of previous execution in every round
 *  until it returns a number greather than zero or any truthy value.
 * @returns {task(done)}
 */
function repeatSeries(times) {
    assert(!arguments.length || !isNaN(+times) || times instanceof Function, 'If provided, first argument of <task>.repeat([times]) must be a number or function.')

    if(!arguments.length)
        times = 1

    if(!(times instanceof Function))
        times = (function (i) { return this - i }).bind(+times)

    var fn = this

    return decorateTask(function (done, recall) {
        var result = [], i = 0

        function next(err, res) {
            if(err)
                done(err)
            else {
                result.push(res)

                if(Math.max(Math.round(+times(i++, res) || 0), 0))
                    fn(next, true)
                else
                    done(null, result)
            }
        }

        fn(next, true)
    }, true)
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


/**
 * @todo
 * * argument assertion
 * * documentation
 * * correct decoration
 */
function timeout(time, message) {
    var fn = this, called, tick, finished

    return decorateTask(function(done, recall) {
        if(called && recall)
            return timeout.call(fn, time, message)(done, recall)

        assert(!called && (called = true) || recall, 'Callback fired more than once.')

        tick = setTimeout(function () {
            finished = true
            done(new Error(message || 'Task timed out. (' + time + 'ms)'))
        }, time)

        fn(function (err, res) {
            if(finished) return

            clearTimeout(tick)
            done(err, res)
        }, recall)
    }, true)
}

/*
 * task virtual constructors
 */

function wrap(successPos, errorPos) {
    assert(errorPos !== successPos, 'You cannot provide error and success callbacks at the same position.')

    var args = Array.prototype.slice.call(arguments, 2),
        fn   = this,
        called

    return decorateTask(function (done, recall) {
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
        fn   = this,
        called

    return decorateTask(function (done, recall) {
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

function base() {
    var args = Array.prototype.slice.call(arguments),
        fn  = this,
        called

    return decorateTask(function (done, recall) {
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

function getTask() {
    var fn = this

    if(isGeneratorFunction(fn))
        return function () {
            var args = Array.prototype.slice.call(arguments),
                ctx  = this

            return function (callback) {
                (new InqPromise(fn(args, ctx))).done(callback)
            }
        }
    else
        return decorateBase(base.bind(fn), fn)
}

/*
 * prop descriptors
 */

function decorateTaskWithRepeat(t) {
    return Object.defineProperties(t, {
        repeat:        { get: function () { return repeat.bind(t) } },
        repeatSeries:  { get: function () { return repeatSeries.bind(t) } },
        timeout:       { get: function () { return timeout.bind(t) } }
    })
}

function decorateTask(t, withRepeat) {
    var desc = {
        retry:    { get: function () { return retry.bind(t) } },
        fallback: { get: function () { return fallback.bind(t) } }
    }

    if(!withRepeat)
        desc.timeout = { get: function () { return timeout.bind(t) } }

    Object.defineProperties(t, desc)

    return withRepeat ? decorateTaskWithRepeat(t) : t
}

function decorateBase(t, fn) {
    Object.defineProperties(t, {
        task: { get: function () { return task.bind(fn) } },
        wrap: { get: function () { return wrap.bind(fn) } }
    })

    return t
}

Object.defineProperties(Function.prototype, {
    inq: { get: getTask },

    $: {
        configurable: true,
        get: getTask
    }
})