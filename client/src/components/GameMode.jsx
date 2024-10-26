import { GAME_MODES } from "../constants"

export default function GameMode({ setGameMode, setIsGameModeSelected }) {
  function handleClickSinglePlayer() {
    console.log('Single player mode ON')
    setIsGameModeSelected(true)
    setGameMode(GAME_MODES.SINGLE)
    window.localStorage.setItem('game-mode', GAME_MODES.SINGLE)
  }
  
  function handleClickDoublePlayer() {
    console.log('Double players mode ON')
    setIsGameModeSelected(true)
    setGameMode(GAME_MODES.DOUBLE)
    window.localStorage.setItem('game-mode', GAME_MODES.DOUBLE)
  }

  return (
    <div className="w-full h-full flex flex-col justify-center items-center gap-x-5">
      <h2 className="text-4xl">Tic tac Loco</h2>
      <div className="mt-20">
        <button onClick={handleClickSinglePlayer}>{ GAME_MODES.SINGLE }</button>
        <button onClick={handleClickDoublePlayer}>{ GAME_MODES.DOUBLE }</button>
      </div>
    </div>
  )
}