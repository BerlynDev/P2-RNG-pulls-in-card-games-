import backside_cards from "./assets/backside_cards.webp"

export function Card () {
    return (
        <article className = "bg-indigo-950 flex flex-wrap  justify-center p-5">
            <button class="transform rounded-xl bg-white shadow-xl transition duration-300 hover:scale-105 p-2">
                <img src={backside_cards} alt="Backside of the card" className="p-2"/>
            </button>
        </article>
    )
}
