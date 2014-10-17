/**
 * Created by schwarzkopfb on 14/10/12.
 */

const COUNT = 50000

var fs = require('fs'),
    $  = require('../lib/$'),
    s  = +(new Date)

function now() {
    return +(new Date) - s
}

//function test(value, callback) {
////    throw 'fake alarm'
//
//    setTimeout(function () {
//        callback(null, 'Hello ' + value)
//    }, Math.floor(Math.random() * 1000) + 500)
//}

//$(function* () {
//    console.log('start', now())
//
//    var text = yield test.$('Jinq!')
//
////    throw 'fake alarm'
//
//    console.log(text, now())
//})

/*
 */

console.log('start', now())

var files   = [ './index.js', './test.js', './test/generators.js', './library/$.js' ],
    stats   = files.$.map(fs.stat)

function done(err, res) {
    console.log('done', now())
//    console.log(err ? err : res)
//    console.log(content.reduce(function (sum, item) {
//        return sum + item.reduce(function (sum, item) {
//            return sum + item.toString().length
//        }, 0)
//    }, 0), 'chars read')
    console.log('end', now())
}

//stats.$.times(COUNT)(done)

$(function* () {
    yield stats.$.times(COUNT)
}).done(done)

/*
 */

//p.failed(function (err) {
//    console.log('ERROR', err)
//})
//
//p.successful(function (res) {
//    console.log(res)
//})

////////////////////////

//console.log('start', now())
//
//function op(fn) {
//    return function () {
//        var args = Array.prototype.slice.call(arguments),
//            ctx  = this,
//            cb   = args.pop()
//
//        var err, res
//
//        try {
//            res = fn.apply(ctx, args)
//            console.log(res);
//        }
//        catch(ex) {
//            err = ex
//        }
//
//        cb(err, res)
//    }
//}
//
//var files = [ './index.js', './test.js', './test/generators.js', './library/$.js' ],
//    ctr   = COUNT,
//    stats = files.$.map(op(fs.statSync))
//
//function done(err, res) {
////    console.log(err ? err : res)
//
//    if(!--ctr)
//        console.log('end', now())
//}
//
//for(var i = COUNT; i > 0; i--)
//    stats(done)