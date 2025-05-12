export function pulling_cards_function (NumberOfPulls, cardPool, rarities) {

    const results = [];
    for (let i = 0; i < NumberOfPulls; i++) {
        results.push(pulledCard(cardPool, rarities));
    }
    return results
    
}
