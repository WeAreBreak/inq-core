/**
 * Created by schwarzkopfb on 14/10/15.
 */

var //fs = require('fs'),
    $  = require('../'),
    s  = +new Date

function now() {
    return +(new Date) - s
}

function randData(callback) {
    var chars = "balzs", res = ""

    for(var i = 0; i < 1024; i++)
        res += chars[Math.floor(Math.random() * chars.length)]

    setTimeout((callback || noop).bind(0, null, res), 500)

    return res
}

function rf(filename, callback) {
    randData(callback)
}

//var i = 0
//
//function test(item, callback) {
//    setTimeout(function () {
//        callback(null, Array.prototype.slice.call(item).reverse().join(''))
//    }, 1000)
//}

//console.log('start', now())
//
//var files   = [ './index.js', './test.js', './test/generators.js', './library/$.js' ],
//    stats   = files.$.map(test)
//
//function done(err, res) {
//    console.log('done', now())
////    console.log(err ? err : res)
////    console.log(content.reduce(function (sum, item) {
////        return sum + item.reduce(function (sum, item) {
////            return sum + item.toString().length
////        }, 0)
////    }, 0), 'chars read')
//    console.log('end', now())
//}

//stats.$.times(COUNT)(done)

//$(function* () {
//    var res = yield stats
//    console.log(res)
//}).done(done)

//////////////////////////////////////////////////////////////

//function noop() { }
//
//function coolData(callback) {
//    setTimeout((callback || noop).bind(0, null, "balzs"), 500)
//}
//
//function randData(callback) {
//    var chars = "balzs", res = ""
//
//    for(var i = 0; i < 8; i++)
//        res += chars[Math.floor(Math.random() * chars.length)]
//
//    setTimeout((callback || noop).bind(0, null, res), 500)
//
//    return res
//}
//
//function* getUserData() {
//    yield {
//        username: randData.$(),
//        email:    (yield randData.$()) + '@' + (yield coolData.$()) + '.com',
//        password: randData.$(),
//    }
//}
//
//function getPostCount(callback) {
//    setTimeout(callback.bind(0, null, Math.floor(Math.random() * 99) + 1), 1000)
//}
//
//function* main() {
//    console.log('start', now());
//
//    var user = yield getUserData()
//
////    console.log('user data fetched', now());
//
//    user.postCount = yield getPostCount.$()
//
////    console.log('post count fetched', now());
//
//    yield user
//
//    console.log('done ' + now())
//}
//
//function mainDone(err, res) {
//    if(err)
//        console.log('ERR\n', err);
//    else
//        console.log(res);
//}
//
//main.$()(mainDone)

/////////////////////////////////

//function test(value, callback) {
//    setTimeout(callback.bind(0, null, value), 500)
//}
//
//function awaitable(fn) {
//    var args = Array.prototype.slice.call(arguments),
//        ctx  = this,
//        fn   = args.shift()
//
//    return function (callback) {
//        args.push(callback)
//        fn.apply(ctx, args)
//    }
//}
//
//function* testGen() {
//    console.log('start', now())
//    var val = yield awaitable(test, 'Hello Generators!')
//    console.log(val)
//    console.log('done', now())
//}
//
//function* test2() {
//    return 42
//}
//
//console.log(test2().next());
//
//var iterator = testGen()
//
//next()
//
//function next(err, res) {
//    var item = iterator.next(res),
//        val  = item.value,
//        done = item.done
//
//    if(!done)
//        val(next)
//    else
//        console.log('done');
//}

////////////////////////////////////////////////////////////////////////


//var fs       = require('fs'),
//    readFile = fs.readFileSync

//var readFile = rf
//
//var files = [ 'nonexisting.txt', 'fakepath.png', 'file.example', 'yo.lo', 'nothingshere.gohome' ];

/* Everyday routine in the callback hell */

//(function () {
//    var results = [],
//        counter = files.length
//
//    function next(i, err, content) {
//        if(err)
//            throw err
//        else
//            results[i] = content
//
//        --counter || console.log(results)
//    }
//
//    for(var i = 0, l = files.length; i < l; i++)
//        readFile(files[i], next.bind(0, i))
//})()

/* InqScript */

//$(function* () {
//    yield files.$.map(readFile)
//}, function (err, result) {
//    err ? console.log('ERR', err) : console.log(result)
//})

//* console.log(await files.$.map(readFile));

////////////////////////////////////////////////////////////////////////////////////////////////

function wait(cb) {
    setTimeout(cb, 200)
}

function* doWork() {
    for(var i = 0; i < 10; i++)
        yield wait.$()

    return 'done'
}

//function square(n, callback) {
//    setTimeout(callback.bind(0, null, n * n), 1000)
//}
//
//var array = [ 1, 2, 3 ]
//
//$(function* () {
//    console.log('start', now())
//    console.log(yield* array.$._map(square))
//    console.log('done', now())
//})

function* map(array, iterator, limit) {
    var entries = array.map(function (item) {
        return iterator.$(item)
    })

    if(limit)
        entries.limit_ = limit

    return yield entries
}

function* nums() {
    var result = []

    for(var i = 1; i <= 15; i++)
        yield result.push(i)

    return result
}

function square(n, cb) {
    console.log('s:', n)
    setTimeout(cb.bind(0, null, n * n), Math.floor(Math.random() * 500) + 500)
}

function getPromise(success, value, error) {
    var p = new Promise(function(resolve, reject) {
        setTimeout(resolve.bind(null, 42), 2500)
    });

    p.then(success, error)

    return p;
}

$(function* () {
    getPromise.$.wrap(0, 2, 'hey!')(function (err, res) {
    console.log('done');
    console.log(err, res);
})

//    console.log(yield* $.series([
//        0,
//        square.$(1),
//        square.$(2),
//        square.$(3),
//        square.$(4),
//        square.$(5),
//        'end'
//    ]))
//
//    console.log(yield* $.series(42))
//    console.log(yield* $.series({ a: 1, b: 2 }))
//    console.log(yield* $.series(true))

//    console.log(yield* (yield* (yield* nums()).$.map(square)).$.filterSeries(function (item, callback) {
//        callback(null, item <= 100)
//    }))
})

//function* test() {
//    var i = 5
//    while(i--) {
//        console.log(i);
//        yield i
//    }
//}
//
//var iter = test()
//
//while(!iter.next().done);

//$(function* () {
//    console.log('start', now())
//    var result = yield* doWork()
//    yield wait.$()
//    console.log(result, now())
//})