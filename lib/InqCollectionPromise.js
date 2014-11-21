/**
 * Created by schwarzkopfb on 14/11/20.
 */

var InqChain = require('./InqChain'),
    define   = require('./define')(InqCollectionPromise.prototype)

/*
 * constructor
 */

function InqCollectionPromise(value) {
    define('value', value, this)
    define('items', [], this)
}

/*
 * instance methods
 */

define([ 'add', 'extend', 'push' ], function (item) {
    if(Function.isGenerator(item) || Object.isIterator(item))
        this.items.push(item)

    return this
})