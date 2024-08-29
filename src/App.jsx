import React, {useState} from 'react'
import Square from './components/Square'
import Board from './components/Board'
import WinnerModal from './components/WinnerModal'
import confetti from 'canvas-confetti'
import { TURNS } from './constants'
import { checkWinnerFrom, checkEndGame } from './board'
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

  function updateBoard(index) {
    
    if (board[index] || winner) return
    
    const newBoard = [...board]
    newBoard[index] = turn
    setBoard(newBoard)

    const newTurn = turn === TURNS.X ? TURNS.O : TURNS.X
    setTurn(newTurn)
    const newWinner = checkWinnerFrom(newBoard)

    window.localStorage.setItem('board', JSON.stringify(newBoard))
    window.localStorage.setItem('turn', newTurn)

    if (newWinner) {
      confetti()
      setWinner(newWinner)
    } else if(checkEndGame(newBoard)) {
      setWinner(false)
    }
    
    // TODO: Check if game is over
  }

  function resetGame() {
    setWinner(null)
    setTurn(prevTurn => prevTurn === TURNS.X ? TURNS.X : TURNS.O)
    setBoard(Array(9).fill(null))

    window.localStorage.removeItem('board')
    windoew.localStorage.removeItem('turn')
  }

  return (
    <main className='w-screen h-screen flex flex-col justify-center items-center'>
      <header className={`flex flex-col justify-center items-center ${winnerOpacity}`}>
        <h1>Tic Tac Loco</h1>
        <button className="my-5 border-white bg-inherit" onClick={resetGame}>Empezar de nuevo</button>
      </header>
      <Board board={board} updateBoard={updateBoard} winnerOpacity={winnerOpacity} />
      <section className={`m-4 flex justify-center items-center space-x-4 h-16 ${winnerOpacity}`}>
        <Square style="w-16 h-16 flex items-center justify-center text-5xl border-none rounded-md hover:bg-inherit" isSelected={turn === TURNS.X}>
          {TURNS.X}
        </Square>
        <Square style="w-16 h-16 flex items-center justify-center text-5xl border-none rounded-md hover:bg-inherit" isSelected={turn === TURNS.O}>
          {TURNS.O}
        </Square>
      </section>
      <WinnerModal winner={winner} resetGame={resetGame} />
    </main>
  )
}

export default App
