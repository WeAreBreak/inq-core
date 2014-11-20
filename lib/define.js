/**
 * Created by schwarzkopfb on 14/11/20.
 */

function notConfigurable() {
    throw new Error('You cannot override inq core members.')
}

module.exports = function (defaultTarget) {
    return function define(names, value, target) {
        var descriptor = {},
            property   = { get: function () { return value }, set: notConfigurable }

        if(Array.isArray(names)) {
            for (var key in names)
                if (names.hasOwnProperty(key))
                    descriptor[names[key]] = property
        }
        else
            descriptor[names] = property

        Object.defineProperties(target || defaultTarget, descriptor)
    }
}