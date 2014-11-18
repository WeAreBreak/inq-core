/**
 * Created by schwarzkopfb on 14/10/15.
 *
 * @todo
 * * ensure recall prevention in all the task factory functions in this file
 */

function noop() {}

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
        i  = 0,
        aborted

    var again = function(done, recall) {
        if(aborted) return
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

    return decorateTask(again, true, function (reason) {
        if(fn.abort)
            fn.abort(reason)

        aborted = true
    })
}

function repeat(times) {
    if(!arguments.length || times instanceof Function)
        return repeatSeries.apply(this, arguments)
    else {
        assert(!isNaN(+times), 'If provided, first argument of <task>.repeat([times]) must be a number or function.')

        var fn = this, aborted

        return decorateTask(function (done, recall) {
            var result = [], finished

            function next(err, res) {
                if (finished || aborted) return

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
        }, true, function (reason) {
            if(fn.abort)
                fn.abort(reason)

            aborted = true
        })
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
    }, true, fn.abort)
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
    }, fn.abort)
}


/**
 *
 *
 * @param time {number}
 * @param message {string|*}
 * @returns {task(done)}
 */
function timeout(time, message) {
    assert(typeof time === 'number' && time >= 0 && time % 1 === 0, 'Timeout must be a positive integer number.')

    var fn = this, called, tick, finished

    return decorateTask(function(done, recall) {
        if(called && recall)
            return timeout.call(fn, time, message)(done, recall)

        assert(!called && (called = true) || recall, 'Callback fired more than once.')

        tick = setTimeout(function () {
            finished = true

            if(fn.abort)
                fn.abort('timeout')

            done(new Error(message || 'timeout of ' + time + 'ms exceeded'))
        }, time)

        fn(function (err, res) {
            if(finished) return

            clearTimeout(tick)
            done(err, res)
        }, recall)
    }, true, fn.abort)
}

/*
 * task virtual constructors
 */

function wrap(successPos, errorPos) {
    assert(typeof successPos === 'number' && successPos >= 0 && successPos % 1 === 0, 'Success callback position must be a positive integer number.')
    assert(typeof errorPos === 'number' && errorPos >= 0 && errorPos % 1 === 0, 'Error callback position must be a positive integer number.')
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

        while(args.length < Math.max(successPos, errorPos) - 1)
            args.push(undefined)

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
    assert(typeof donePos === 'number' && donePos >= 0 && donePos % 1 === 0, 'Callback position must be a positive integer number.')

    var args = Array.prototype.slice.call(arguments, 1),
        fn   = this,
        called

    return decorateTask(function (done, recall) {
        while(args.length < donePos - 1)
            args.push(undefined)

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

/**
 * The base function to be cloned when we're creating tasks.
 *
 * @returns {task(done)}
 */
function base() {
    var args = Array.prototype.slice.call(arguments),
        fn   = this,
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

/**
 * Factory method to wrap a function into a task.
 * Accepts a regular function with callback or a generator.
 *
 * @returns {task(done)}
 */
function getTask() {
    var fn = this

    if(isGeneratorFunction(fn))
        return function () {
            var args = Array.prototype.slice.call(arguments), promise

            var task = function (callback, recall) {
                (promise = new InqPromise(fn.apply(this, args))).done(callback)
            }

            function abortTask(reason) {
                promise && promise.abort(reason)
            }

            return decorateTask(task, true, abortTask)
        }
    else
        return decorateBase(base.bind(fn), fn)
}

/*
 * decorators
 */

/**
 * Attach task repetition methods to the given task.
 *
 * @param t {task(done)} The task to decorate.
 * @param [abort] {function(reason)} A function that will terminate the execution of the current task composition if it's possible.
 */
function decorateTaskWithRepeat(t, abort) {
    var desc = {
        repeat:        { get: function () { return repeat.bind(t) } },
        repeatSeries:  { get: function () { return repeatSeries.bind(t) } },
        timeout:       { get: function () { return timeout.bind(t) } }
    }

    if(!t.abort)
        desc.abort = { value: abort || t.abort || noop }

    return Object.defineProperties(t, desc)
}

/**
 * Attach control flow methods to the given task.
 *
 * @param t {task(done)} The task to decorate.
 * @param [withRepeat] {boolean} Pass any truthy value to also attach task repetition methods.
 * @param [abort] {function(reason)} A function that will terminate the execution of the current task composition if it's possible.
 * @returns {task(done)}
 */
function decorateTask(t, withRepeat, abort) {
    var desc = {
        retry:    { get: function () { return retry.bind(t) } },
        fallback: { get: function () { return fallback.bind(t) } }
    }

    if(!withRepeat) {
        desc.timeout = { get: function () { return timeout.bind(t) } }

        if(!t.abort)
            desc.abort = { value: abort || t.abort || noop }
    }

    Object.defineProperties(t, desc)

    return withRepeat ? decorateTaskWithRepeat(t, abort) : t
}

/**
 * Attach specialised task factory methods to the given task base.
 *
 * @param t {task(done)} The task to decorate.
 * @param fn {Function} The function that will be wrapt into a task by one of the factories.
 * @returns {task(done)}
 */
function decorateBase(t, fn) {
    Object.defineProperties(t, {
        task: { get: function () { return task.bind(fn) } },
        wrap: { get: function () { return wrap.bind(fn) } }
    })

    return t
}

// extend Function prototype with '$' and 'inq' getters
Object.defineProperties(Function.prototype, {
    inq: { get: getTask },

    $: {
        configurable: true,
        get: getTask
    }
})