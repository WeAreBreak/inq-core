/*function awaitable(callback) {
    callback(null, 42);
}

function async getAnswer(times) {
    var answer = await awaitable();
    return "The answer is " + answer * times;
}

async {
    console.log(await getAnswer(2));
}*/

//------------------------

/*function awaitable(callback) {
    callback(null, 42);
}

function* getAnswer(times) {
    var answer = await awaitable();
    return "The answer is " + answer * times;
}

*console.log(await getAnswer(2));*/


//-------------------------

/*function awaitable(callback) {
    callback(null, 42);
}

function* getAnswer(times) {
    var answer = yield awaitable.$();
    return "The answer is " + answer * times;
}

(inq ? inq : require('inq'))(function* () {
    console.log(yield getAnswer.$(2));
});*/

function async valami(a) {
    if(a) {
        var lista = new Array();
        //FOR
        for(var i = 0; i < 10; ++i) {
            var result = await asszinkronIzé(i);
            lista.push(result);
        }
        //END FOR
        //AFTER FOR
        return lista;
    }
    else {
        //B
        //C
    }
}

//$(valami)
async valami("alma");
