import { useState } from "react"
import { GAME_MODES, DIFFICULTY, DIFFICULTY_LABELS } from "../constants"
import { XIcon, CircleIcon, UserIcon, CpuIcon, GlobeIcon } from "lucide-react"

const DIFFICULTY_ORDER = [DIFFICULTY.EASY, DIFFICULTY.MEDIUM, DIFFICULTY.HARD]

const DIFFICULTY_STYLES = {
  [DIFFICULTY.EASY]: 'hover:border-green-500 hover:text-green-500',
  [DIFFICULTY.MEDIUM]: 'hover:border-yellow-500 hover:text-yellow-500',
  [DIFFICULTY.HARD]: 'hover:border-red-500 hover:text-red-500',
}

export default function GameMode({ setGameMode, setIsGameModeSelected, setIsHowToPlayOpen, setDifficulty }) {
  const [choosingDifficulty, setChoosingDifficulty] = useState(false)

  function startGame(mode) {
    setIsGameModeSelected(true)
    setGameMode(mode)
    window.localStorage.setItem('is-game-mode-selected', true)
    window.localStorage.setItem('game-mode', mode)
  }

  function handleClickDoublePlayer() {
    startGame(GAME_MODES.DOUBLE)
  }

  function handleClickOnline() {
    startGame(GAME_MODES.ONLINE)
  }

  function handleSelectDifficulty(level) {
    setDifficulty(level)
    window.localStorage.setItem('difficulty', level)
    startGame(GAME_MODES.SINGLE)
  }

  return (
    <>
      <header className='w-full absolute top-0 flex justify-end px-4 py-2 z-30'>
          <button
            className="px-3 py-1 border-2 border-white rounded-md hover:bg-gray-800 hover:text-white transition duration-300 text-sm md:text-base"
            onClick={() => setIsHowToPlayOpen(true)}
          >
            Cómo jugar
          </button>
      </header>
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#242424] text-white p-4 relative">

        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 transform -translate-x-1/2 -translate-y-1/2 opacity-10">
            <XIcon size={200} className="text-[#EF4444]" />
          </div>
          <div className="absolute bottom-1/4 right-1/2 md:right-1/4 transform translate-x-1/2 translate-y-1/2 opacity-10">
            <CircleIcon size={200} className="text-[#3C82F6]" />
          </div>
        </div>

        <h1 className="text-5xl md:text-6xl font-bold mb-8 text-center z-10">
          {["T", "i", "c", " ", "T", "a", "c", " ", "L", "o", "c", "o"].map((char, index) => (
            <span
              key={index}
              className={`inline-block ${
                index % 2 === 0 ? "hover:text-[#EF4444]" : "hover:text-[#3C82F6]"
              }`}
            >
              {char}
            </span>
          ))}
        </h1>

        {choosingDifficulty ? (
          <div className="flex flex-col items-center gap-4 w-full max-w-xl z-10">
            <p className="text-lg font-semibold">Elige la dificultad</p>
            <div className="flex flex-row gap-4 flex-wrap justify-center">
              {DIFFICULTY_ORDER.map((level) => (
                <button
                  key={level}
                  onClick={() => handleSelectDifficulty(level)}
                  className={`w-28 h-20 flex items-center justify-center bg-gray-200 text-[#242424] font-semibold rounded-lg border-2 border-transparent hover:scale-105 transition-all duration-200 ${DIFFICULTY_STYLES[level]}`}
                >
                  {DIFFICULTY_LABELS[level]}
                </button>
              ))}
            </div>
            <button
              onClick={() => setChoosingDifficulty(false)}
              className="mt-2 text-sm text-gray-400 hover:text-white transition-colors duration-200"
            >
              ← Volver
            </button>
          </div>
        ) : (
          <div className="flex flex-row flex-wrap gap-6 w-full max-w-2xl items-center justify-center z-10">
            <button
              onClick={handleClickDoublePlayer}
              className="w-40 h-32 flex items-center group justify-center p-4 bg-gray-200 hover:border-gray-200 text-[#242424] rounded-lg hover:scale-105 transition-transform duration-200 ease-in-out"
            >
              <div className="flex flex-col items-center">
                <UserIcon className="h-10 w-10 mb-1" />
                <span className="text-sm font-semibold">Jugador</span>
              </div>
              <span className="mx-3 text-xl font-bold group-hover:text-[#3C82F6] transition-colors duration-200">VS</span>
              <div className="flex flex-col items-center">
                <UserIcon className="h-10 w-10 mb-1" />
                <span className="text-sm font-semibold">Jugador</span>
              </div>
            </button>
            <button
              onClick={() => setChoosingDifficulty(true)}
              className="w-40 h-32 flex items-center group justify-center p-4 bg-gray-200 hover:border-gray-200 text-[#242424] rounded-lg hover:scale-105 transition-transform duration-200 ease-in-out"
            >
              <div className="flex flex-col items-center">
                <UserIcon className="h-10 w-10 mb-1" />
                <span className="text-sm font-semibold">Jugador</span>
              </div>
              <span className="mx-3 text-xl font-bold group-hover:text-[#EF4444] transition-colors duration-200">VS</span>
              <div className="flex flex-col items-center">
                <CpuIcon className="h-8 w-8 md:h-10 md:w-10 mb-1" />
                <span className="text-sm font-semibold">IA</span>
              </div>
            </button>
            <button
              onClick={handleClickOnline}
              className="w-40 h-32 flex flex-col items-center group justify-center p-4 bg-gray-200 hover:border-gray-200 text-[#242424] rounded-lg hover:scale-105 transition-transform duration-200 ease-in-out"
            >
              <GlobeIcon className="h-10 w-10 mb-2 group-hover:text-[#3C82F6] transition-colors duration-200" />
              <span className="text-sm font-semibold">Online</span>
            </button>
          </div>
        )}
      </div>
    </>
  )
}
