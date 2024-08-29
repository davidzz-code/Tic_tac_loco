import React, {useState} from 'react'
import Turns from './components/Turns'
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
        <h2 className="text-xl">Tic Tac Loco</h2>
        <button className="my-5 border-white bg-inherit" onClick={resetGame}>Empezar de nuevo</button>
      </header>
      <Board board={board} updateBoard={updateBoard} winnerOpacity={winnerOpacity}/>
      <Turns turn={turn} winnerOpacity={winnerOpacity} />
      <WinnerModal winner={winner} resetGame={resetGame} />
    </main>
  )
}

export default App
