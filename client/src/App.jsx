import './App.css'
import { io } from 'socket.io-client'
import { TURNS } from './constants'
import React, {useState, useEffect} from 'react'
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

  const socket = io('http://localhost:3000')
  const [isConnected, setIsConnected] = useState(false)
  useEffect(() => {

    socket.on('connect', () => setIsConnected(true))

    socket.on('syncBoard', (data) => {
      setBoard(data.board)
      setTurn(data.turn)
      setActiveSquares(data.activeSquares)
    })

    return () => {
      socket.off('connect')
      socket.off('syncBoard')
    }
  }, [])

  function resetGame() {
    const blankBoard = Array(9).fill(Array(9).fill(null))
    const blankActiveSquares = Array(9).fill({
      opacity: 'opacity-100',
      disableClick: false,
      hover: 'hover:bg-gray-700 hover:cursor-pointer',
    })
    const blankTurn = TURNS.X
    const blankEndGameOpacity = 'opacity-100 blur-none'
    const blankWinner = null    
    
    setBoard(blankBoard)
    setActiveSquares(blankActiveSquares)
    setTurn(blankTurn)
    setEndGameOpacity(blankEndGameOpacity)
    setWinner(blankWinner)

    window.localStorage.removeItem('board')
    window.localStorage.removeItem('turn')
    window.localStorage.removeItem('active-squares')

    sendBoard(blankBoard, blankTurn, blankActiveSquares, blankEndGameOpacity, blankWinner)
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
    window.localStorage.setItem('active-squares', JSON.stringify(redirectMove(newBoard, squareIndex, activeSquares)))

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
    const newActiveSquares = redirectMove(newBoard, squareIndex, activeSquares)
    setActiveSquares(newActiveSquares)

    sendBoard(newBoard, newTurn, newActiveSquares)
  }

  function sendBoard(newBoard, newTurn, newActiveSquares, newEndGameOpacity = endGameOpacity, newWinner = winner) {
    socket.emit('syncBoard', {
      user: socket.id,
      board: newBoard,
      turn: newTurn,
      activeSquares: newActiveSquares,
      endGameOpacity: newEndGameOpacity,
      winner: newWinner,
    })
  }

  return (
    <main className="w-screen h-screen flex flex-col justify-center items-center">
      <header className={`w-full flex justify-between items-center px-4 py-2 ${endGameOpacity}`}>
        <h2 className="text-xl font-semibold">Tic Tac Loco</h2>
        <button
          className="px-3 py-1 border-2 border-white rounded-md hover:bg-gray-800 hover:text-white transition duration-300"
          onClick={resetGame}
        >
          Restart
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
