

export function Probabilities () {

    const cards = [["a", "b", "c", "d", "e", "f", "g"], ["h", "i", "j", "k", "l", "m"], ["n", "o", "p", "q", "r", "s", "t"], ["u", "v", "w", "x", "y", "z"], "ñ"] 

    const p = [0.40, 0.30, 0.20, 0.10, 0.01]

    //const SubRandomLetter = cards[Math.floor(Math.random() * cards.length)][Math.floor(Math.random() * cards.length)]

    /* 
    Tb puedo hacerlo como objeto, pool1: ["a", "b", "c", "d", "e", "f", "g"] y al resultado hacer q de un random de cualquiera de esas letras?
    */

    // function proba (x) {
    //     if (x < 0.40) {return cards[0]}
    //     else if (x < 0.70) {return cards[1]}
    //     else if (x < 0.90) {return cards[2]}
    //     else if (x < 0.99) {return cards[3]}
    //     else {return cards[4]}
    // }

    function proba (x) {
        if (x < p[0]) {return cards[0]}
        else if (x < p[0] + p[1]) {return cards[1][Math.floor(Math.random() * cards[1].length)]}
        else if (x < p[0] + p[1] + p[2]) {return cards[2][Math.floor(Math.random() * cards[2].length)]}
        else if (x < p[0] + p[1] + p[2] + p[3]) {return cards[3][Math.floor(Math.random() * cards[3].length)]}
        else {return cards[4][Math.floor(Math.random() * cards[4].length)]}
    }

    for (j=0; j<100; j++) {
        x = Math.random()
        i = proba(x)
        console.log(cards[i])
    }

    return (
        proba(cards)
    )
}  


/*
Sources:
https://medium.com/arcvision-blog/choosing-objects-probabilistically-in-javascript-part-i-ce460870a944

https://dustinpfister.github.io/2021/12/24/js-javascript-example-item-probability/
*/

/*
Por el momento no esta definido las probabilidades de aparicion, ya que todo depende de x, que es un numero aleatorio, y no de en si el rango de probabilidades
*/   

