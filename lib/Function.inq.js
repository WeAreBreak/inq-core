/**
 * Created by schwarzkopfb on 14/10/15.
 */

var InqPromise = require('./InqPromise')

function isGeneratorFunction(obj) {
    return obj && obj.constructor && obj.constructor.name === 'GeneratorFunction'
}

Function.isGenerator = Function.isGeneratorFunction = isGeneratorFunction

Object.defineProperty(Function.prototype, '$', {
    get: function () {
        var fn = this

        function InqTask() {
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

//            callback.until = function (predicate) {
//                return function (done) {
//                    function next() {
//                        if(toValue(predicate))
//                            fn.apply(ctx, args.concat(next))
//                        else
//                            done()
//                    }
//
//                    next()
//                }
//            }

            return callback
        }

        InqTask.times = function (n) {
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
            return InqTask
    }
})

Function.$ = {
    noConflict: function () {
        delete Function.prototype.$
        Function.prototype.$ = before
    }
}

var before = Function.prototype.$