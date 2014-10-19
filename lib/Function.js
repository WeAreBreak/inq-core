/**
 * Created by schwarzkopfb on 14/10/15.
 */

var assert     = require('assert'),
    InqPromise = require('./InqPromise')

function isGeneratorFunction(obj) {
    return obj && obj.constructor && obj.constructor.name === 'GeneratorFunction'
}

Function.isGenerator = Function.isGeneratorFunction = isGeneratorFunction

function task() {
    var fn = this

    function inqTask() {
        var args = Array.prototype.slice.call(arguments),
            ctx  = this

        function callback(done) {
            var called

            args.push(function() {
                if (!called && (called = true))
                    done.apply(fn, arguments)
            })

            try {
                fn.apply(ctx, args)
            }
            catch (ex) {
                done(ex)
            }
        }

        return callback
    }

    inqTask.wrap = function wrap(successPos, errorPos) {
        assert(errorPos !== successPos, 'You cannot provide error and success callbacks at the same position.')

        var args = Array.prototype.slice.call(arguments, 2)

        return function (done) {
            var called

            function error(err) {
                if (!called && (called = true))
                    done(err)
            }

            function success(res) {
                if (!called && (called = true))
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
                fn.apply(this, args)
            }
            catch(ex) {
                done(ex)
            }
        }
    }

    inqTask.task = function task(donePos) {
        var args = Array.prototype.slice.call(arguments, 1)

        return function (done) {
            var called

            args.splice(donePos, 0, function () {
                if (!called && (called = true))
                    done.apply(this, arguments)
            })

            try {
                fn.apply(this, args)
            }
            catch(ex) {
                done(ex)
            }
        }
    }

    inqTask.times = function (n) {
        return function (done) {

            var finished, result = []

            function complete(err, res) {
                if(finished) return

                if(err) {
                    finished = true
                    return done(err)
                }
                else if(res)
                    result.push(res)

                --n || done(null, result)
            }

            for(var i = n; i > 0; i--)
                fn(complete)
        }
    }

    if(Function.isGenerator(fn))
        return function () {
            var args = Array.prototype.slice.call(arguments),
                ctx  = this

            return function (callback) {
                (new InqPromise(fn(args, ctx))).done(callback)
            }
        }
    else
        return inqTask
}

Object.defineProperties(Function.prototype, {
    inq: { get: task },

    $: {
        configurable: true,
        get: task
    }
})