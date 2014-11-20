/**
 * Created by schwarzkopfb on 14/11/1.
 */

var assert = require('assert')

require('..')

function fn() {}

describe('chain', function () {
    it('construction', function () {
        assert(inq.chain(42).value === 42, 'InqChain instance should be constructed and its initial value should be accessible')

        //yield $.chain(42).exec
    })
})