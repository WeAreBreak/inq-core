/**
 * Created by schwarzkopfb on 14/10/14.
 */

//function* map(iterator, concurrent) {
//    var entries = this.map(function (item) {
//        return iterator.inq(item)
//    })
//
//    if(concurrent)
//        entries.concurrent_ = concurrent
//
//    return yield entries
//}

function map(iterator, concurrency) {
    if(Function.isGenerator(iterator))
        throw 'Not Implemented'
    else
        return this.map(iterator)
}

function* mapSeries(iterator) {
    var result = []

    for(var i = 0, l = this.length; i < l; i++)
        result[i] = yield iterator.inq(this[i])

    return result
}

function* each(iterator, concurrent) {
    var entries = this.map(function (item) {
        return iterator.inq(item)
    })

    if(concurrent)
        entries.concurrent_ = concurrent

    yield entries
}

function* eachSeries(iterator) {
    for(var i = 0, l = this.length; i < l; i++)
        yield iterator.inq(this[i])
}

function* filter(iterator) {
    var result = []

    yield this.map(function (item, i) {
        return function (callback) {
            iterator(item, function (keep) {
                if(keep)
                    result.push({ i: i, value: item })

                callback(null, keep)
            })
        }
    })

    return result.sort(function (a, b) { return a.i - b.i }).map(function (item) { return item.value })
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
        filter: filter.bind(this),
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