/**
 * Created by schwarzkopfb on 14/10/15.
 */

var Iterator = Iterator || (function*(){})().constructor

function isIterator(obj) {
    return obj && obj.next instanceof Function// && obj.constructor && obj.constructor.name === 'GeneratorFunctionPrototype'
}

global.Iterator = Iterator
Object.isIterator = isIterator