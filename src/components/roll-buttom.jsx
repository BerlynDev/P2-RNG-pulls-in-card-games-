export function RollButtom ({name, onclick, children}) {
    return (
        <button name={name} onClick={onclick}>
            {children}
        </button>
    )
}