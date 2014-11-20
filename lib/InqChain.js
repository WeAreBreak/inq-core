/**
 * Created by schwarzkopfb on 14/11/20.
 */

var InqPromise = require('./InqPromise'),
    define     = require('./define')(InqChain.prototype)

/*
 * constructor
 */

function InqChain(value) {
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

define([ 'start', 'execute', 'exec' ], function (value, callback) {
    var items = this.items,
        index = 0

    if(!arguments.length) {
        value    = this.value
        callback = noop
    }
    else if(arguments.length === 1) {
        callback = value
        value    = this.value
    }

    function next(res) {
        value = res

        if(index < items.length) {
            var item = items[index++]

            if(Function.isGenerator(item))
                item = item(value);

            (new InqPromise(item)).success(next).error(callback)
        }
        else
            callback(null, value)
    }

    if(items.length)
        next(value)
    else
        callback(null, value)

    return this
})

/*
 *
 */

/*
 * exposition
 */

module.exports = InqChain