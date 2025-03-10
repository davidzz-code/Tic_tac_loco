import { GAME_MODES } from "../constants"
import { XIcon, CircleIcon, UserIcon, CpuIcon, BookOpenCheck } from "lucide-react"

export default function GameMode({ setGameMode, setIsGameModeSelected, setIsHowToPlayOpen }) {
  function handleClickSinglePlayer() {
    console.log('Single player mode ON')
    setIsGameModeSelected(true)
    setGameMode(GAME_MODES.SINGLE)
    window.localStorage.setItem('is-game-mode-selected', true)
    window.localStorage.setItem('game-mode', GAME_MODES.SINGLE)
  }
  
  function handleClickDoublePlayer() {
    console.log('Double players mode ON')
    setIsGameModeSelected(true)
    setGameMode(GAME_MODES.DOUBLE)
    window.localStorage.setItem('is-game-mode-selected', true)
    window.localStorage.setItem('game-mode', GAME_MODES.DOUBLE)
  }

  function openHowToPlay() {
    setIsHowToPlayOpen(true)
  }

  return (
    <>
      <header className='w-full absolute top-0 flex justify-end px-4 py-2 z-30'>
          <button
            className="px-3 py-1 border-2 border-white rounded-md hover:bg-gray-800 hover:text-white transition duration-300 text-sm md:text-base"
            onClick={openHowToPlay}
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
        
        <div className="flex flex-row gap-6 w-full max-w-xl items-center justify-center z-10">
          <button 
            onClick={handleClickDoublePlayer}
            className="w-42 h-32 flex items-center group justify-center p-4 bg-gray-200 hover:border-gray-200 text-[#242424] rounded-lg hover:scale-105 transition-transform duration-200 ease-in-out"
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
            onClick={handleClickSinglePlayer}
            className="w-42 h-32 flex items-center group justify-center p-4 bg-gray-200 hover:border-gray-200 text-[#242424] rounded-lg hover:scale-105 transition-transform duration-200 ease-in-out"
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
        </div>
      </div>
    </>
  )
}