/**
 * Created by schwarzkopfb on 14/11/1.
 */

Object.defineProperty(Object.prototype, 'concurrent', {
    value: function (n) {
        this.concurrent_ = n
        return this
    }
})