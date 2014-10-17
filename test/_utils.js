/**
 * Created by schwarzkopfb on 14/10/16.
 */

var start

var exports = module.exports = {
    now: function (label) {
        var stamp = 0

        if(start)
            stamp = (+new Date - start)
        else
            start = +new Date

        return stamp
    },

    compareObj: function (obj1, obj2) {
        if(!(obj1 instanceof Object && obj2 instanceof Object))
            return false

        for(var key in obj1)
            if(obj1[key] !== obj2[key])
                return false

        for(var key in obj2)
            if(obj1[key] !== obj2[key])
                return false

        return true
    },

    delay: function (callback) {
        return setTimeout(callback, Math.floor(Math.random() * 5) + 25)
    },

    section: function (text) {
        return exports.title(text, true)
    },

    title: function (text, isSection) {
        var args = Array.prototype.slice.call(arguments)

        return [
            function (next) {
                if(!isSection)
                    args.push(exports.now())
                else {
                    args.pop()
                    args.unshift('-')
                    args.push('-')
                }

                console.log.apply(console.log, args)
                next()
            }
        ]
    },

    test: function() {
        var args = Array.prototype.slice.call(arguments), task

        if(typeof args[0] === 'string')
            args[0] = exports.section(args[0], exports.now())

        function next(err, res) {
            if(Array.isArray(task) && task.length >= 2)
                task[1].apply(this, arguments)

            if(task = args.shift())
                task[0](next)
            else
                console.log('- ok -')
        }

        next()
    }
}