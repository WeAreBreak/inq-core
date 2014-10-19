/* WARNING: GENERATED CODE. DO NOT MODIFY THIS FILE!   
   InqScript to JavaScript Compiler v0.3 */

$ = 'before'

var inq = require('../'),
    fs = require("fs"),
    path = require("path");

//function readFile(file, callback) {
//    fs.readFile(path.resolve(__dirname, "./files/" + file), { encoding: "utf8" }, callback);
//}
//
//inq(function* () {
//    var start = +new Date,
//        files = yield [ readFile.$("app.js"), readFile.$("chat.cs"), readFile.$("test.js"), readFile.$("test1.ces"), readFile.$("test2.inq"), readFile.$("test3.inq") ];
//
//    console.log("josag\n" + files.join("\n\n") + "\n\n" + ((+new Date - start) / 1000));
//}).error(function(err) {
//    console.log("cink\n" + err);
//});


//////////////////////////////////////////////////////////////////////////////

var start = +new Date;

//var files = [ "fake.txt", "app.js", "chat.cs", "test.js", "_chat.cs", "test1.ces", "test2.inq", "_test2.inq", "test3.inq", "nonexisting.js" ];
//var readFile = function(file, callback) {
//    console.log(file, (+new Date - start) / 1000)
//
//    return setTimeout(function() {
//        return fs.readFile(file, { encoding: "utf8" }, callback)
//    }, 500)
//};

//$.noConflict()

var wrap_test_1 = (function (val1, error, val2, success, val3) {
    success(val1 + val2 + val3)
}).$.wrap(3, 1, 1, 2, 3)(function (err, res) {
    console.log('err', err, '\nres', res);
})

var wrap_test_2 = (function (val1, done, val2, val3) {
    done(null, val1 + val2 + val3)
}).$.task(1, 1, 2, 3)(function (err, res) {
    console.log('err', err, '\nres', res);
})

var wrap_test_3 = setTimeout.inq.task(0, 4000)(function () {
    console.log('delayed!');
})

var errors = 0

function error(callback) {
    console.log('- try', errors);

    setTimeout(function () {
        callback(++errors)
    }, 500)
}

var wrap_test_4 = error.inq().retry(5)(function (err, res) {
    console.log('err', err, '\nres', res);
})

//var p = $(function* () {
////    var self = this
//
////    setTimeout(function () {
////        self.reject('en elobb untam meg')
////    }, 1200)
//
//    files = yield* files.map(function (file) { return path.resolve(__dirname, 'files/' + file) }).$.filter(fs.exists)
//
//    yield* $.series([
//        $.wait(500),
//        $.wait(500),
//        $.wait(500),
//        $.wait(500)
//    ])
//
//    yield* files.inq.mapSeries(readFile)
//    console.log((+new Date - start) / 1000);
//}).error(function (err) {
//    console.log('ERR', err);
//});

//setTimeout(function () {
//    p.reject('meguntam')
//}, 1400)

//////////////////////////////////////////////////////////////////////////////

//var counter = 0, finished
//
//function done(err) {
//    if(err)
//        console.log('cink\n' + err)
//    else {
//        console.log(((+new Date - start) / 1000))
////        console.log('josag\n' + files.join('\n\n') + '\n\n' + ((+new Date - start) / 1000))
//    }
//}
//
//function next(err, res) {
//    var file = files[counter]
//
//    if(finished) return
//
//    if(err) {
//        finished = true
//        return done(err)
//    }
//    else
//        files[counter] = res
//
//    if(++counter < files.length) {
//        readFile(files[counter], next)
//    }
//    else
//        done()
//}
//
//readFile(files[counter], next)