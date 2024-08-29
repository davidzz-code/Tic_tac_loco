import { TURNS } from "../constants"
import Square from "./Square"

export default function Turns({ turn, winnerOpacity }) {
  return (
    <section className={`m-4 flex justify-center items-center space-x-4 h-16 ${winnerOpacity}`}>
      <Square style="w-16 h-16 flex items-center justify-center text-5xl border-none rounded-md hover:bg-inherit" isSelected={turn === TURNS.X}>
        {TURNS.X}
      </Square>
      <Square style="w-16 h-16 flex items-center justify-center text-5xl border-none rounded-md hover:bg-inherit" isSelected={turn === TURNS.O}>
        {TURNS.O}
      </Square>
    </section>
  )
}