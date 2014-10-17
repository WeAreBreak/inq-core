/**
 * Created by schwarzkopfb on 14/10/16.
 */

require('../')

var assert = require('assert'),
    utils  = require('./_utils'),
    test   = utils.test,
    title  = utils.title

function iterator1(item, callback) {
    utils.delay(callback.bind(0, null, item * item))
}

function iterator2(item, callback) {
    utils.delay(callback.bind(0, new Error))
}

var nums = [ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9 ]

function map1(err, res) {
    assert(!err, 'error eccoured through mapping')
    assert(utils.compareObj(res, [ 0, 1, 4, 9, 16, 25, 36, 49, 64, 81 ]), 'incorrect result array')
}

function map2(err, res) {
    assert(err, 'error not caught through mapping')
    assert(res === undefined, 'unexpected result array')

    assert(utils.compareObj(nums, [ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9 ]), 'source array modified')
}

test('map',
    [ nums.$.map(iterator1), map1 ],
    [ nums.$.map(iterator2), map2 ],

    title('Array.$.map'),

    [ nums.$.mapSeries(iterator1), map1 ],
    [ nums.$.mapSeries(iterator2), map2 ],

    title('Array.$.mapSeries'),

    [ nums.$.mapLimit(3, iterator1), map1 ],
    [ nums.$.mapLimit(3, iterator2), map2 ],

    title('Array.$.mapLimit')
)