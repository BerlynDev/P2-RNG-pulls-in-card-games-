import { cardPool } from ".components/data/card-pool.jsx"
import { rarities } from ".components/data/rarities.jsx"

export function Probabilities (cardPool, rarities) {
    
    const weigthedPool = [];
    for (const rarity in rarities) {
        const numCards = Math.round(rarities[rarity] * 100);
        for (let i = 0; i < numCards; i++) {
            const card = cardPool.find(card => card.rarity === rarity);
            weigthedPool.push(card);
        }

    }

    const randomIndex = Math.floor(Math.random() * weigthedPool.length);
    const pulledRarity = weightedPool[randomIndex];
    const availableCards = cardPool.filter(card => card.rarity === pulledRarity);
    const cardIndex = Math.floor(Math.random() * availableCards.length);
    return availableCards[cardIndex];

}  




