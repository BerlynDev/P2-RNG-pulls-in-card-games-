export function RollButtom ({onclick, children}) {
    return (
        <button onClick={onclick} className = " relative flex items-center justify-center bg-fuchsia-900 p-2 rounded-xl text-white">
            <div className="absolute inset-0 bg-gradient-to-r from-violet-50 to-indigo-500 rounded-lg"/>
            <div className="px-8 py-2  bg-indigo-950 rounded-[6px]  relative group transition duration-200 text-white hover:bg-transparent hover:text-indigo-950 hover:font-medium">
                {children}
            </div>
        </button>
    )
}