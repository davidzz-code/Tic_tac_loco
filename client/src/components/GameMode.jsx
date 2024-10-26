import { GAME_MODES } from "../constants"

export default function GameMode({ setGameMode, setIsGameModeSelected }) {
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

  return (
    <div className="w-full h-screen flex flex-col justify-center items-center bg-[#242424] text-[#F0F0F0] relative">
      <h2 className="text-7xl font-bold tracking-widest mb-12 text-[#CA8A03] z-10">
        Tic Tac Loco
      </h2>
      <div className="flex flex-col space-y-8 z-10">
        <button 
          onClick={handleClickSinglePlayer} 
          className="flex items-center justify-center px-10 py-3 text-lg rounded-md bg-transparent text-[#F0F0F0] border-2 border-white hover:border-[#3c82f6] transition-all duration-200"
        >
          {GAME_MODES.SINGLE}
        </button>
        <button 
          onClick={handleClickDoublePlayer} 
          className="flex items-center justify-center px-10 py-3 text-lg rounded-md bg-transparent text-[#F0F0F0] border-2 border-white hover:border-[#ef4444] transition-all duration-200"
        >
          {GAME_MODES.DOUBLE}
        </button>
      </div>
    </div>
  );
}