/**
 * Created by schwarzkopfb on 14/11/20.
 */

var extend = require('util')._extend

function notConfigurable() {
    throw new Error('You cannot override inq core members.')
}

module.exports = function (defaultTarget) {
    return function define(names, value, target, keepAliases) {
        var descriptor = {},
            property   = { get: function () { return value }, set: notConfigurable, enumerable: true }

        if(Array.isArray(names)) {
            for (var key in names) {
                if (names.hasOwnProperty(key))
                    descriptor[names[key]] = property

                if(property.enumerable)
                    (property = extend({}, property)).enumerable = false

                if(!property.configurable && !keepAliases)
                    (property = extend({}, property)).configurable = true
            }
        }
        else
            descriptor[names] = property

        return Object.defineProperties(target || defaultTarget, descriptor)
    }
}