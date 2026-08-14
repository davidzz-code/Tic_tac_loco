import { TURNS, GAME_MODES } from "../constants"
import Square from "./Square"
import { UserIcon, CpuIcon } from "lucide-react"

export default function Turns({ turn, endGameOpacity, gameMode, isAiThinking }) {
  const isSingle = gameMode === GAME_MODES.SINGLE

  return (
    <section className={`m-4 flex flex-col justify-center items-center space-y-2 ${endGameOpacity}`}>
      <div className="flex justify-center items-center space-x-4 h-16">
        <UserIcon className={`h-10 w-10 mb-1 ${turn === TURNS.X ? 'opacity-100' : 'opacity-20'}`} />
        <Square style={`w-16 h-16 flex items-center justify-center text-5xl border-none rounded-md hover:bg-inherit`} isSelected={turn === TURNS.X} turn={turn} opacity="opacity-20">
          {TURNS.X}
        </Square>
        <Square style={`w-16 h-16 flex items-center justify-center text-5xl border-none rounded-md hover:bg-inherit`} isSelected={turn === TURNS.O} turn={turn} opacity="opacity-20">
          {TURNS.O}
        </Square>
        {isSingle ? (
          <CpuIcon className={`h-10 w-10 mb-1 ${turn === TURNS.O ? 'opacity-100' : 'opacity-20'}`} />
        ) : (
          <UserIcon className={`h-10 w-10 mb-1 ${turn === TURNS.O ? 'opacity-100' : 'opacity-20'}`} />
        )}
      </div>

      {/* Fixed height reserves the row so the board doesn't jump when it appears. */}
      <div className="h-5 flex items-center">
        {isSingle && isAiThinking && (
          <span className="flex items-center gap-2 text-sm text-gray-300">
            La IA está pensando
            <span className="flex gap-1.5">
              <span className="ai-dot w-2.5 h-2.5 rounded-full border-2 border-blue-500" style={{ animationDelay: '0ms' }} />
              <span className="ai-dot w-2.5 h-2.5 rounded-full border-2 border-blue-500" style={{ animationDelay: '200ms' }} />
              <span className="ai-dot w-2.5 h-2.5 rounded-full border-2 border-blue-500" style={{ animationDelay: '400ms' }} />
            </span>
          </span>
        )}
      </div>
    </section>
  )
}
