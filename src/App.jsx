import React, {useState} from 'react'
import SmallTicTacToe from './components/SmallTicTacToe'
import { TURNS } from './constants'
import './App.css'


function App() {
  const [board, setBoard] = useState(() => {
    const boardFromStorage = window.localStorage.getItem('board')
    return boardFromStorage ? JSON.parse(boardFromStorage) : Array(9).fill(null)
  })
  const [turn, setTurn] = useState(() => {
    const turnFromStorage = window.localStorage.getItem('turn')
    return turnFromStorage ? turnFromStorage : TURNS.X
  })
  const [winner, setWinner] = useState(null)
  const winnerOpacity = winner || board.every(square => square !== null) ? 'opacity-50 blur-sm' : null


  function resetGame() {
    setWinner(null)
    setTurn(prevTurn => prevTurn === TURNS.X ? TURNS.X : TURNS.O)
    setBoard(Array(9).fill(null))

    window.localStorage.removeItem('board')
    windoew.localStorage.removeItem('turn')
  }

  return (
    <main className="w-screen h-screen flex flex-col justify-center items-center">
      <header className={`w-full flex justify-between items-center px-4 py-2 ${winnerOpacity}`}>
        <h2 className="text-xl font-semibold">Tic Tac Loco</h2>
        <button
          className="px-3 py-1 border-2 border-white rounded-md hover:bg-gray-800 hover:text-white transition duration-300"
          onClick={resetGame}
        >
          Empezar de nuevo
        </button>
      </header>
      <SmallTicTacToe
        board={board}
        turn={turn}
        winner={winner}
        setBoard={setBoard}
        setTurn={setTurn}
        setWinner={setWinner}
        resetGame={resetGame}
        winnerOpacity={winnerOpacity}
      />
    </main>
  )
}

export default App
