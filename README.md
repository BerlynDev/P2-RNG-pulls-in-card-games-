This is a JavaScript RNG (Random Number Generator) practice.

I'm using vite + react.

On this page, I'm using the entire alphabet as the card pool. Each letter represents a card that can be pulled by the RNG. 

Important notes:

- A is NOT equal to a. 

    The alphabet is divided into rarities as follows:
    - ABCDEFG: Common rarity (C) - 40%
    - HIJKLM: Rare rarity (R) - 30%
    - NOPQRST: Super rarity (S) - 20%
    - UVWXYZ: Ultra rarity (S) - 9.9%
    - Ñ: OMG rarity (OMG) - 0.1%

Each pack contains 5 cards,and each cards has independent odds of being any rarity. Also, there is also a chance for a card to be "brilliant" -- that is, uppercase instead of lowercase:

- Lowercase (a): 90%
- Uppercase (A): 10%

To do:
- The RNG code on JS
- The visuals of the packs
