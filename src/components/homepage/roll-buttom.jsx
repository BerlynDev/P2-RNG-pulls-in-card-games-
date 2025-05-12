import { pulling_cards_function } from "./components/homepage/pulling_cards_function.jsx"
import { cardPool } from "./components/data/card-pool.jsx"
import { rarities } from "./components/data/rarities.jsx"

export function RollButtom ({onclick, children, pulling_cards_function}) {
    return (
        <button onClick={() => onclick(pulling_cards_function(5, cardPool, rarities ))} className = " relative flex items-center justify-center bg-fuchsia-900 p-2 rounded-xl text-white">
            <div className="absolute inset-0 bg-gradient-to-r from-violet-50 to-indigo-500 rounded-lg"/>
            <div className="px-8 py-2  bg-indigo-950 rounded-[6px]  relative group transition duration-200 text-white hover:bg-transparent hover:text-indigo-950 hover:font-medium">
                {children}
            </div>
        </button>
    )
}