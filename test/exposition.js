/**
 * Created by schwarzkopfb on 14/11/1.
 */

var assert = require('assert')

require('..')

function fn() {}

describe('exposition', function () {
    it('global', function () {
        assert(inq instanceof Function, 'global.inq should be a Function')
        assert($ instanceof Function,   'global.$ should be a Function')
        assert(Iterator !== undefined, 'Iterator shoud exist')
    })

    it('Object.isIterator', function () {
        assert(Object.isIterator, 'Object.isIterator should exist')
    })

    it('Function.isGenerator', function () {
        assert(Function.isGenerator, 'Function.isGenerator should exist')
    })

    it('inq', function () {
        assert(inq.wait instanceof Function,       'inq.wait shoud be a Function')
        assert(inq.series instanceof Function,     'inq.series shoud be a Function')
        assert(inq.bound instanceof Function,      'inq.bound shoud be a Function')
        assert(inq.delegated instanceof Function,  'inq.delegated shoud be a Function')
        assert(inq.noConflict instanceof Function, 'inq.noConflict shoud be a Function')

        assert.throws(function () {
            inq.wait = false
        }, /override/, 'inq core members should not be overridden')
    })

    it('Array.prototype', function () {
        assert([].$   instanceof Object, 'Array.prototype.$ should be an Object')
        assert([].inq instanceof Object, 'Array.prototype.inq should be an Object')
    })

    it('Function.prototype', function () {
        assert(fn.$   instanceof Function, 'Function.prototype.$ should be a Function')
        assert(fn.inq instanceof Function, 'Function.prototype.inq should be a Function')
        assert(fn.inq() instanceof Function, 'Function.prototype.inq() should return a Function')
        assert(fn.inq.task instanceof Function, 'Function.prototype.inq.task() should return a Function')
        assert(fn.inq.wrap instanceof Function, 'Function.prototype.inq.wrap() should return a Function')
    })

    it('noConflict', function () {
        $.noConflict()

        assert.throws(function () {
            return $
        }, ReferenceError, 'global.$ should not exist')

        assert(inq,   'global.inq should exist')
        assert(![].$,  'Array.prototype.$ should not exist')
        assert([].inq, 'Array.prototype.inq should exist')
        assert(!function(){}.$,  'Function.prototype.$ should not exist')
        assert(function(){}.inq, 'Function.prototype.inq should exist')
    })
})