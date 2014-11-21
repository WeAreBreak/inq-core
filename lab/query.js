/**
 * Created by schwarzkopfb on 14/11/21.
 */

require('..')

$(function* () {
    var query, nums = [ 1, 2, 3, 4, 5, 6, 7, 8, 9 ]

    query = nums.$
        .where(function (n) {
            return n > 5
        })
        .select(function (n) {
            return {
                id: n * n
            }
        })

    console.log(yield query.exec())
})
