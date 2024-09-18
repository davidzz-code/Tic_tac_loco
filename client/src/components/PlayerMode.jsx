import { PLAYER_MODES } from "../constants"

export default function PlayerMode({ setPlayerMode, setIsPlayerModeSelected }) {
  function handleClickSinglePlayer() {
    console.log('Single player mode ON')
    setIsPlayerModeSelected(true)
    setPlayerMode(PLAYER_MODES.SINGLE)
    
  }
  
  function handleClickDoublePlayer() {
    console.log('Double players mode ON')
    setIsPlayerModeSelected(true)
    setPlayerMode(PLAYER_MODES.DOUBLE)
  }

  function handleClickOnlinePlayer() {
    console.log('Comming soon!')
  }

  return (
    <div className="w-full h-full flex flex-col justify-center items-center gap-x-5">
      <h2 className="text-4xl">Tic tac Loco</h2>
      <div className="mt-20">
        <button onClick={handleClickSinglePlayer}>{ PLAYER_MODES.SINGLE }</button>
        <button onClick={handleClickDoublePlayer}>{ PLAYER_MODES.DOUBLE }</button>
        <button onClick={handleClickOnlinePlayer}>{ PLAYER_MODES.ONLINE }</button>
      </div>
    </div>
  )
}