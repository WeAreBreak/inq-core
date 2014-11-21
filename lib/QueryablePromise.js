/**
 * Created by schwarzkopfb on 14/11/21.
 */

var PromiseBase = require('./PromiseBase'),
    Chain       = require('./Chain')

function InqQueryablePromise(value) {
    PromiseBase.call(this)

    var self  = this,
        chain = new Chain(value || [])

    Object.defineProperties(this, {
        _chain: {
            get: function () { return chain }
        },

        $: {
            get: function () { return self }
        }
    })
}

require('util').inherits(InqQueryablePromise, PromiseBase)

/*
 * utilities
 */

var define = require('./define')(InqQueryablePromise.prototype)

/*
 * execute iteration
 */

function execute() {
    if(this._state === 0) {
        this._state = 1

        var self = this

        this._chain.start(function (err, res) {
            if(err)
                self.reject(err)
            else
                self.resolve(res)
        })
    }

    return this
}

define([ 'execute', 'exec', 'start', 'run', 'get', 'result' ], execute)

/*
 ** query methods
 */

/*
 * map
 */

function map(fn) {
    if(Function.isGenerator(fn))
        throw "Not implemented yet."
    else
        this._chain.add(function* (arr) {
            return Array.prototype.map.call(arr, fn)
        })

    return this
}

define([ 'map', 'select' ], map)

/*
 * filter
 */

function filter(fn) {
    if(Function.isGenerator(fn))
        throw "Not implemented yet."
    else
        this._chain.add(function* (arr) {
            return Array.prototype.filter.call(arr, fn)
        })

    return this
}

define([ 'filter', 'where' ], filter)

/*
 * expose
 */

module.exports = InqQueryablePromise