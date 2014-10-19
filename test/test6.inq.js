/* WARNING: GENERATED CODE. DO NOT MODIFY THIS FILE!   
   InqScript to JavaScript Compiler v0.3 */

$ = 'before'

var inq = require('../'),
    fs = require("fs"),
    path = require("path");

function readFile(file, callback) {
    fs.readFile(path.resolve(__dirname, "./files/" + file), { encoding: "utf8" }, callback);
}
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

var files = [ "app.js", "chat.cs", "test.js", "test1.ces", "test2.inq", "test3.inq" ];
var readFile = function(file, callback) { console.log(file, (+new Date - start) / 1000); return setTimeout(function() { return fs.readFile(path.resolve(__dirname, "./files/" + file), {
    encoding: "utf8"
}, callback) }, 500) };

//$.noConflict()

$(function* () {
    yield* files.inq.map(readFile)
    console.log((+new Date - start) / 1000);
});

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