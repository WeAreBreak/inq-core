/**
 * Created by schwarzkopfb on 14/10/14.
 */

function* map(iterator, limit) {
    var entries = this.map(function (item) {
        return iterator.$(item)
    })

    if(limit)
        entries.limit_ = limit

    return yield entries
}

function* mapSeries(iterator) {
    var result = []

    for(var i = 0, l = this.length; i < l; i++)
        result[i] = yield iterator.$(this[i])

    return result
}

function* each(iterator, limit) {
    var entries = this.map(function (item) {
        return iterator.$(item)
    })

    if(limit)
        entries.limit_ = limit

    yield entries
}

function* eachSeries(iterator) {
    for(var i = 0, l = this.length; i < l; i++)
        yield iterator.$(this[i])
}

function* filterSeries(iterator) {
    var result = []

    for(var i = 0, l = this.length; i < l; i++)
        if(yield iterator.$(this[i]))
            result.push(this[i])

    return result
}

var before = Array.prototype.$

Array.$ = {
    noConflict: function () {
        delete Array.$
        delete Array.prototype.$
        Array.prototype.$ = before
    }
}

Object.defineProperty(Array.prototype, '$', {
    configurable: true,

    get: function () {
        return {
            map: map.bind(this),
            mapSeries: mapSeries.bind(this),
            each: each.bind(this),
            eachSeries: eachSeries.bind(this),
            filterSeries: filterSeries.bind(this)
        }
    }
})