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

// TODO
// - times: function
// - delay: number
// - delay: function
function retry(times) {
    var fn = this

    var again = function(done) {
        fn(function (err) {
            if (err) {
                if (times--)
                    again(done)
                else
                    done(err)
            }
            else
                done.apply(fn, arguments)
        }, true)
    }

    return again
}

function fallback() {

}

function decorateTask(t) {
    Object.defineProperties(t, {
        retry:    { get: function () { return retry.bind(t) } },
        fallback: { get: function () { return fallback.bind(t) } }
    })

    return t
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
    })
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
    })
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
    })
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