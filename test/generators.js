/**
 * Created by schwarzkopfb on 14/10/11.
 */

var assert = require('assert')

function $(fn, done) {
    assert(fn instanceof Function, 'Invalid argument provided for $(fn)')

    done = done || function (err) {
        if(err)
            setImmediate(function () { throw err })
    }

    var iterator = fn.call(this), ctx = this, item, value, res

    function end(err, result) {
        setImmediate(done.bind(ctx, err, result))
    }

    function next(err, result) {
        item  = iterator.next(result)
        value = item.value

        if(err)
            return end(err)
        else if(item.done)
            return end(null, result)
        else if(value instanceof Object && !(value instanceof Function))
            value = awaitObject(value)
        else if(!(value instanceof Function))
            return next()

        value.call(ctx, function () {
            next.apply(0, arguments)
        })
    }

    next()
}

$.after   =
$.wait    =
$.timeout =
$.delay   = function (delay) {
    return function (callback) {
        setTimeout(callback, delay)
    }
}

function awaitObject(obj, callback) {
    var finished, key

    var results = Array.isArray(obj) ? [] : {},
        keys    = Object.keys(obj),
        pending = keys.length

    return function (callback) {
        if(!pending)
            return callback(null, results)

        function done(err, result) {
            if(finished) return

            results[this] = result

            --pending || callback(null, results)
        }

        while(key = keys.shift()) {
            obj[key](done.bind(key))
        }
    }
}

function toValue(value) {
    return !!(value instanceof Function ? value() : value)
}

Object.defineProperty(Function.prototype, '$', {
    get: function () {
        var fn = this

        return function() {
            var args = Array.prototype.slice.call(arguments),
                ctx  = this

            function callback(done) {
                var called;

                args.push(function(){
                    if (called) return;
                    called = true;
                    done.apply(null, arguments);
                });

                try {
                    fn.apply(ctx, args);
                } catch (err) {
                    done(err);
                }
            }

            callback.until = function (predicate) {
                return function (done) {
                    function next() {
                        if(toValue(predicate))
                            fn.apply(ctx, args.concat(next))
                        else
                            done()
                    }

                    next()
                }
            }

            return callback
        }
    }
})

Object.defineProperty(Array.prototype, '$', {
    get: function () {
        var arr = this

        return {
            map: function (selector) {
                var finished, results = [], pending = arr.length

                return function (callback) {
                    if(!pending)
                        return callback(null, results)

                    function done(err, result) {
                        if(finished) return

                        results[this] = result

                        --pending || callback(null, results)
                    }

                    for(var i = 0, l = pending; i < l; i++)
                        selector(arr[i], done.bind(i))
                }
            }
        }
    }
})

//////

var fs = require('fs')

var from;

function now() {
    if(!from)
        from = +(new Date)

    return +(new Date) - from
}

function test(value, callback) {
    console.log('call test(' + value + ')', now())

//    console.log(alma);

    setTimeout(function () {
        callback(null, value)
    }, Math.floor(Math.random() * 500) + 1000)
}

function done(err, result) {
    console.log(' ')

    if(err)
        console.log('ERROR', err)
    else
        console.log('RESULT', result)
}

// series

//$(function* () {
//    console.log('start', now())
//
//    var testVal1 = yield test.$('done1 ' + now()),
//        testVal2 = yield test.$('done2 ' + now())
//
//    console.log('end', now())
//    console.log('result', testVal1, testVal2)
//}, done)

// parallel

//$(function* () {
//    console.log('start', now())
//
//    yield $.wait(500)
//
//    var test1 = test.$('done1 ' + now()),
//        test2 = test.$('done2 ' + now()),
//        testVals = yield [ test1, test2 ]
//
//    console.log('end', now())
//    console.log('result', testVals[0], testVals[1])
//}, done)

// fs.stat demo

//$(function* () {
//    var files = [ './index.js', './test.js', './test/generators.js', './library/$.js' ],
//        stats = yield files.$.map(fs.stat)
//
//    console.log(stats)
//})

//(function () {
//    var files   = [ './index.js', './test.js', './test/generators.js', './library/$.js' ],
//        stats   = [],
//        counter = files.length
//
//    function next(i, err, content) {
//        if(err)
//            throw err
//        else
//            stats[i] = content
//
//        --counter || console.log(stats)
//    }
//
//    for(var i = 0, l = files.length; i < l; i++)
//        fs.readFile(files[i], next.bind(0, i))
//})()

// context (series)

//function doWork() {
//    $(function* () {
//        console.log('start', now())
//        console.log('ctx', this.Hello ? this : 'not important')
//
//        this.Hello = yield test.$('World!')
//
//        console.log('ctx', this.Hello ? this : 'not important')
//        console.log('end', now())
//    }.bind(this))
//}
//
//doWork.call({ Hello: 'JS Generators!' })

// timeout

//function doWorkSometimes(counter) {
//    if(!arguments.length)
//        counter = 3
//
//    $(function* () {
//        console.log("hey, it's", now() + '!')
//
//        yield $.wait(1000)
//
//        if(counter)
//            doWorkSometimes(counter - 1)
//    })
//}
//
//doWorkSometimes()

// repeat while predicate fn returns true

//function doWorkSometimes(counter) {
//    if(!arguments.length)
//        counter = 3
//
//    $(function* () {
//        yield $.wait(1000);
//
//        console.log("hey, it's", now(), '!')
//
//        yield doWorkSometimes.$(counter - 1).until(counter > 0)
//    })
//}
//
//console.log("start", now())
//doWorkSometimes()

///

//function doWorkUntil(cb, ctr) {
//    if(arguments.length == 1)
//        ctr = 3
//
//    console.log(ctr)
//
//    doWorkUntil.$(cb, ctr - 1).until(ctr > 0)(cb)
//}
//
//console.log("start", now())
//doWorkUntil(function () {
//    console.log('done', now())
//})

//$.until = function (fn, condition) {
//    return function (callback) {
//        if(condition)
//            fn(function (err) {
//                if(err)
//                    callback(err)
//                else
//                    callback(null, true)
//            })
//        else
//            callback(null, null)
//    }
//}

$.until = function (condition) {
    return function (callback) {
        if(condition)
            callback(null, true)
        else
            callback(null, false)
    }
}

function noop() { }

function randData(callback) {
    var chars = "balzs", res = ""

    for(var i = 0; i < 8; i++)
        res += chars[Math.floor(Math.random() * chars.length)]

    setTimeout((callback || noop).bind(0, null, res), 500)

    return res
}

$(function* () {
    console.log('start', now());

    console.log({
        test1: yield randData.$(),
        test2: yield randData.$(),
        test3: yield randData.$(),
        test4: yield randData.$()
    });

    console.log('part', now());

    console.log(yield {
        test1: randData.$(),
        test2: randData.$(),
        test3: randData.$(),
        test4: randData.$()
    });

    console.log('done', now());
})