/**
 * Created by schwarzkopfb on 14/11/20.
 */

var a = {
    doWork: function () {
        console.log('a')
    }
}

var b = {
    doWork: function () {
        console.log('b')
    }
}

var c = {
    doWork: function () {
        console.log('c')
    }
}

function* doAllWork() {
    yield this.doWork()
    yield this.doWork()
    yield this.doWork()
}

var iterator = doAllWork.call(a)

iterator.next.call(iterator)
iterator.next()
iterator.next()