import './App.css'
import { TURNS } from './constants'
import React, {useState} from 'react'
import Turns from './components/Turns'
import Board from './components/Board'
import confetti from 'canvas-confetti'
import WinnerModal from './components/WinnerModal'
import { checkWinnerSmallBoard, checkEndGame, checkWinnerMainBoard, redirectMove } from './board'


function App() {
  const [board, setBoard] = useState(() => {
    const boardFromStorage = window.localStorage.getItem('board')
    return boardFromStorage ? JSON.parse(boardFromStorage) : Array(9).fill(Array(9).fill(null))
  })
  const [turn, setTurn] = useState(() => {
    const turnFromStorage = window.localStorage.getItem('turn')
    return turnFromStorage ? turnFromStorage : TURNS.X
  })
  const [winner, setWinner] = useState(null)
  const [endGameOpacity, setEndGameOpacity] = useState('')
  const [activeSquares, setActiveSquares] = useState(() => {
    const activeSquareFromStorage = window.localStorage.getItem('active-squares')
    return activeSquareFromStorage ? JSON.parse(activeSquareFromStorage) :
      Array(9).fill({
        opacity: 'opacity-100',
        disableClick: false,
        hover: 'hover:bg-gray-700 hover:cursor-pointer',
      })
  })

  function resetGame() {
    setWinner(null)
    setTurn(prevTurn => prevTurn === TURNS.X ? TURNS.X : TURNS.O)
    setBoard(Array(9).fill(Array(9).fill(null)))
    setEndGameOpacity('opacity-100 blur-none')
    setActiveSquares(Array(9).fill({
      opacity: 'opacity-100',
      disableClick: false,
      hover: 'hover:bg-gray-700 hover:cursor-pointer',
    }))

    window.localStorage.removeItem('board')
    window.localStorage.removeItem('turn')
    window.localStorage.removeItem('active-squares')
  }

  function updateBoard(boardIndex, squareIndex) {
    
    if (board[boardIndex][squareIndex] || winner) return
    
    const newBoard = [...board]
    newBoard[boardIndex] = [...newBoard[boardIndex]]
    newBoard[boardIndex][squareIndex] = turn
    setBoard(newBoard)

    const newTurn = turn === TURNS.X ? TURNS.O : TURNS.X
    setTurn(newTurn)

    const smallBoardWinner = checkWinnerSmallBoard(newBoard[boardIndex])

    window.localStorage.setItem('board', JSON.stringify(newBoard))
    window.localStorage.setItem('turn', newTurn)
    window.localStorage.setItem('active-squares', JSON.stringify(redirectMove(board, squareIndex, activeSquares)))

    if (smallBoardWinner) {
      newBoard[boardIndex] = smallBoardWinner
      setBoard(newBoard)

      const newWinner = checkWinnerMainBoard(newBoard)

      if (newWinner) {
        confetti()
        setWinner(newWinner)
        setEndGameOpacity('opacity-70 blur-sm')
      } else if (checkEndGame(newBoard)) {
        setEndGameOpacity('opacity-70 blur-sm')
        setWinner(false)
      }
    }
    const newActiveSquares = redirectMove(board, squareIndex, activeSquares)
    setActiveSquares(newActiveSquares)
  }

  return (
    <main className="w-screen h-screen flex flex-col justify-center items-center">
      <header className={`w-full flex justify-between items-center px-4 py-2 ${endGameOpacity}`}>
        <h2 className="text-xl font-semibold">Tic Tac Loco</h2>
        <button
          className="px-3 py-1 border-2 border-white rounded-md hover:bg-gray-800 hover:text-white transition duration-300"
          onClick={resetGame}
        >
          Empezar de nuevo
        </button>
      </header>
      <section className='w-screen h-screen flex flex-col justify-center items-center'>
        <Board board={board} updateBoard={updateBoard} turn={turn} endGameOpacity={endGameOpacity} activeSquares={activeSquares} />
        <Turns turn={turn} endGameOpacity={endGameOpacity} />
        <WinnerModal winner={winner} resetGame={resetGame} />
    </section>
    </main>
  )
}

export default App
