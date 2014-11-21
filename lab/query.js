/**
 * Created by schwarzkopfb on 14/11/21.
 */

require('..')

var fs = require('fs')

$(function* () {
    var query,
        nums  = [ 1, 2, 3, 4, 5, 6, 7, 8, 9 ],
        files = [ 'chain.js', 'query.js', 'this.js', 'yield.js' ]

    //query = $
    //    .from(nums)
    //    .where(function (n) {
    //        return n > 5
    //    })
    //    .select(function (n) {
    //        return {
    //            id: n * n
    //        }
    //    })
    //    .last(function (item) {
    //        return item.id < 60
    //    })
    //    .first()
    //
    //console.log((yield query.exec()) - 7)

    query =
       $.from(files)
        .map(function (item) {
            return __dirname + '/' + item
        })
        .map(function* (file) {
            return yield fs.readFile.$(file, { encoding: 'utf8' })
        })
        .select(function (content) {
            return content.replace(/\n|\t|\r/g, '').replace(/\s{2,}/g, ' ')
        })

    console.log(yield query.exec());
})
