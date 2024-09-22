import { GAME_MODES } from "../constants"

export default function GameMode({ setGameMode, setIsGameModeSelected }) {
  function handleClickSinglePlayer() {
    console.log('Single player mode ON')
    setIsGameModeSelected(true)
    setGameMode(GAME_MODES.SINGLE)
    window.localStorage.setItem('gameMode', GAME_MODES.SINGLE)
    
  }
  
  function handleClickDoublePlayer() {
    console.log('Double players mode ON')
    setIsGameModeSelected(true)
    setGameMode(GAME_MODES.DOUBLE)
    window.localStorage.setItem('gameMode', GAME_MODES.DOUBLE)
  }

  function handleClickOnlinePlayer() {
    console.log('Comming soon!')
    window.localStorage.setItem('gameMode', GAME_MODES.ONLINE)
  }

  return (
    <div className="w-full h-full flex flex-col justify-center items-center gap-x-5">
      <h2 className="text-4xl">Tic tac Loco</h2>
      <div className="mt-20">
        <button onClick={handleClickSinglePlayer}>{ GAME_MODES.SINGLE }</button>
        <button onClick={handleClickDoublePlayer}>{ GAME_MODES.DOUBLE }</button>
        <button onClick={handleClickOnlinePlayer}>{ GAME_MODES.ONLINE }</button>
      </div>
    </div>
  )
}