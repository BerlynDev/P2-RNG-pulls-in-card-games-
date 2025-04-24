import backside_cards from "../assets/backside_cards.webp"

export function Card () {
    return (
        <article>
            <button>
                <img src={backside_cards} alt="Backside of the card" className="p-2"/>
            </button>
        </article>
    )
}