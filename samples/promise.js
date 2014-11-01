/**
 * Created by schwarzkopfb on 14/11/1.
 */

require('../')

function* series() {
    var p1 = new Promise(function (resolve, reject) {
        setTimeout(function () {
            resolve(':)')
        }, 1000)
    })

    var p2 = new Promise(function (resolve, reject) {
        setTimeout(function () {
            reject(42)
        }, 1000)
    })

    console.log(yield p1)
    yield p2
}

function* parallel() {
    var p1 = new Promise(function (resolve, reject) {
        setTimeout(function () {
            resolve(':)')
        }, 2000)
    })

    var p2 = new Promise(function (resolve, reject) {
        setTimeout(function () {
            // what is the answer ... blah blah
            resolve(42)
        }, 1000)
    })

    console.log(yield [ p1, p2 ])
}

$(series).then(function (res) {
    console.log('done series', res)
}, function (err) {
    console.log('error series', err)

    $(parallel).then(function (res) {
        console.log('done parallel', res)
    })
})