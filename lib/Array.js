/**
 * Created by schwarzkopfb on 14/10/14.
 */

function* map(iterator, limit) {
    var entries = this.map(function (item) {
        return iterator.inq(item)
    })

    if(limit)
        entries.limit_ = limit

    return yield entries
}

function* mapSeries(iterator) {
    var result = []

    for(var i = 0, l = this.length; i < l; i++)
        result[i] = yield iterator.inq(this[i])

    return result
}

function* each(iterator, limit) {
    var entries = this.map(function (item) {
        return iterator.inq(item)
    })

    if(limit)
        entries.limit_ = limit

    yield entries
}

function* eachSeries(iterator) {
    for(var i = 0, l = this.length; i < l; i++)
        yield iterator.inq(this[i])
}

function* filterSeries(iterator) {
    var result = []

    for(var i = 0, l = this.length; i < l; i++)
        if(yield iterator.inq(this[i]))
            result.push(this[i])

    return result
}

function repo() {
    return {
        map: map.bind(this),
        mapSeries: mapSeries.bind(this),
        each: each.bind(this),
        eachSeries: eachSeries.bind(this),
        filterSeries: filterSeries.bind(this)
    }
}

Object.defineProperties(Array.prototype, {
    inq: { get: repo },

    $: {
        configurable: true,
        get: repo
    }
})