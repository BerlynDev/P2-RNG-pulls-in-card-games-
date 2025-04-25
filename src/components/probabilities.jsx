export function Probabilities () {
    const cards = [["a", "b", "c", "d", "e", "f", "g"], ["h", "i", "j", "k", "l", "m"], ["n", "o", "p", "q", "r", "s", "t"], ["u", "v", "w", "x", "y", "z"], "ñ"] 
    const p = [0.40, 0.30, 0.20, 0.10, 0.01]

    // function proba (x) {
    //     if (x < 0.40) {return cards[0]}
    //     else if (x < 0.70) {return cards[1]}
    //     else if (x < 0.90) {return cards[2]}
    //     else if (x < 0.99) {return cards[3]}
    //     else {return cards[4]}
    // }
    function proba (x) {
        if (x < p[0]) {return cards[0]}
        else if (x < p[0] + p[1]) {return cards[1]}
        else if (x < p[0] + p[1] + p[2]) {return cards[2]}
        else if (x < p[0] + p[1] + p[2] + p[3]) {return cards[3]}
        else {return cards[4]}
    }

    for (j=0; j<100; j++) {
        x = Math.random()
        i = proba(x)
        console.log(cards[i])
    }

    return (
        proba(x)
    )
}  


/*
Sources:
https://medium.com/arcvision-blog/choosing-objects-probabilistically-in-javascript-part-i-ce460870a944

https://dustinpfister.github.io/2021/12/24/js-javascript-example-item-probability/
*/