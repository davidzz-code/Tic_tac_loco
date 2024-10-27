import { TURNS, GAME_MODES } from "../constants"
import Square from "./Square"
import { UserIcon, CpuIcon } from "lucide-react"

export default function Turns({ turn, endGameOpacity, gameMode }) {

  return (
    <section className={`m-4 flex justify-center items-center space-x-4 h-16 ${endGameOpacity}`}>
      <UserIcon className={`h-10 w-10 mb-1 ${turn === TURNS.X ? 'opacity-100' : 'opacity-20'}`} />
      <Square style={`w-16 h-16 flex items-center justify-center text-5xl border-none rounded-md hover:bg-inherit`} isSelected={turn === TURNS.X} turn={turn} opacity="opacity-20">
        {TURNS.X}
      </Square>
      <Square style={`w-16 h-16 flex items-center justify-center text-5xl border-none rounded-md hover:bg-inherit`} isSelected={turn === TURNS.O} turn={turn} opacity="opacity-20">
        {TURNS.O}
      </Square>
      {gameMode === GAME_MODES.SINGLE
        ? <CpuIcon className={`h-10 w-10 mb-1 ${turn === TURNS.O ? 'opacity-100' : 'opacity-20'}`} />
        : <UserIcon className={`h-10 w-10 mb-1 ${turn === TURNS.O ? 'opacity-100' : 'opacity-20'}`} />
      }
    </section>
  )
}