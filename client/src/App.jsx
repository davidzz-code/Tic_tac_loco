import './App.css'
import { io } from 'socket.io-client'
import OpenAI from 'openai'
import { GAME_MODES, TURNS } from './constants'
import React, {useState, useEffect} from 'react'
import Turns from './components/Turns'
import Board from './components/Board'
import RoomManager from './components/RoomManager'
import GameMode from './components/GameMode'
import confetti from 'canvas-confetti'
import WinnerModal from './components/WinnerModal'
import { checkWinnerSmallBoard, checkEndGame, checkWinnerMainBoard, redirectMove } from './board'


function App() {
  const [board, setBoard] = useState(() => {
    try {
      const boardFromStorage = window.localStorage.getItem('board')
      return boardFromStorage ? JSON.parse(boardFromStorage) : Array(9).fill(Array(9).fill(null))
    } catch (error) {
      console.error("Error parsing board from storage:", error)
      return Array(9).fill(Array(9).fill(null))
    }
  })
  const [turn, setTurn] = useState(() => {
    const turnFromStorage = window.localStorage.getItem('turn')
    return turnFromStorage ? turnFromStorage : TURNS.X
  })
  const [winner, setWinner] = useState(null)
  const [endGameOpacity, setEndGameOpacity] = useState('')
  const [activeSquares, setActiveSquares] = useState(() => {
    try {
      const activeSquareFromStorage = window.localStorage.getItem('active-squares')
      return activeSquareFromStorage ? JSON.parse(activeSquareFromStorage) :
        Array(9).fill({
          opacity: 'opacity-100',
          disableClick: false,
          hover: 'hover:bg-gray-700 hover:cursor-pointer',
        })
    } catch (error) {
      console.error("Error parsing active squares from storage:", error)
      return Array(9).fill({
        opacity: 'opacity-100',
        disableClick: false,
        hover: 'hover:bg-gray-700 hover:cursor-pointer',
      })
    }
  })

  const [roomId, setRoomId] = useState('')
  const [connectedRoom, setConnectedRoom] = useState(false)
  const [isGameModeSelected, setIsGameModeSelected] = useState(false)
  const [gameMode, setGameMode] = useState('')
  // const client = new OpenAI(process.env.OPENAI_API_KEY)
  let socket;
  
  async function sendBoardToChatGPT(newBoard) {
    try {
      const response = await fetch('http://localhost:3000/process-board', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ newBoard })
      })

      // Verifica si la respuesta HTTP es correcta
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      console.log('Tablero actualizado:', data.updatedBoard)
      setBoard(data.updatedBoard)

    } catch (error) {
      console.error('Error sending the board to the server on /process-board:', error)
    }
  }

  if (isGameModeSelected && gameMode === GAME_MODES.ONLINE) {
    socket = io('localhost:3000', {
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 5000,
      autoConnect: true,
    })
    
    // const [isLocked, setIsLocked] = useState(false)
    useEffect(() => {

      socket.on('connect', () => {
        console.log('Connected to server')
      })

      socket.on('syncBoard', (data) => {
        console.log('Received syncBoard with data:', data)
        setBoard(data.board)
        setTurn(data.turn)
        setActiveSquares(data.activeSquares)
        setEndGameOpacity(data.endGameOpacity)
        setWinner(data.winner)
        // setIsLocked(false)

        if (data.board) {
          window.localStorage.setItem('board', JSON.stringify(data.board))
          window.localStorage.setItem('turn', data.turn)
          window.localStorage.setItem('active-squares', JSON.stringify(data.activeSquares))
        } 
      })

      return () => {
        socket.off('connect')
        socket.off('syncBoard')
      }
    }, [])
  }
  
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

    socket ? sendBoard(blankBoard, blankTurn, blankActiveSquares, blankEndGameOpacity, blankWinner) : null
  }
  
  function resetGameMode() {
    resetGame()
    setIsGameModeSelected(false)
    setGameMode('')
  }

  function updateBoard(boardIndex, squareIndex) {
    
    if (board[boardIndex][squareIndex] || winner) return

    // setIsLocked(true)
    
    const newBoard = [...board]
    newBoard[boardIndex] = [...newBoard[boardIndex]]
    newBoard[boardIndex][squareIndex] = turn
    setBoard(newBoard)

    const newTurn = turn === TURNS.X ? TURNS.O : TURNS.X
    setTurn(newTurn)

    const smallBoardWinner = checkWinnerSmallBoard(newBoard[boardIndex])
    let newWinner;
    let newEndGameOpacity;

    if (smallBoardWinner) {
      newBoard[boardIndex] = smallBoardWinner
      setBoard(newBoard)

      newWinner = checkWinnerMainBoard(newBoard)

      if (newWinner) {
        confetti()
        setWinner(newWinner)
        setEndGameOpacity('opacity-70 blur-sm')
        newEndGameOpacity = 'opacity-70 blur-sm'
      } else if (checkEndGame(newBoard)) {
        setEndGameOpacity('opacity-70 blur-sm')
        newEndGameOpacity = 'opacity-70 blur-sm'
        newWinner = false
        setWinner(false)
      }
    }
    const newActiveSquares = redirectMove(newBoard, squareIndex, activeSquares)
    setActiveSquares(newActiveSquares)

    gameMode === GAME_MODES.ONLINE ? sendBoard(newBoard, newTurn, newActiveSquares, newEndGameOpacity, newWinner) : null
    gameMode === GAME_MODES.SINGLE ? sendBoardToChatGPT(newBoard) : null
  }

  function sendBoard(newBoard, newTurn, newActiveSquares, newEndGameOpacity = null, newWinner = null) {
    console.log('socket:', socket)
    if (!socket.connected) {
      console.error("Socket no está conectado. No se enviaron los datos.");
      return;
    }
    socket.emit('syncBoard', {
      roomId,
      board: newBoard,
      turn: newTurn,
      activeSquares: newActiveSquares,
      endGameOpacity: newEndGameOpacity,
      winner: newWinner
    })
  }

  return (
    <main className="w-screen h-screen flex flex-col justify-center items-center">
      {isGameModeSelected
        ? (
          <>
            <header className={`w-full flex justify-between items-center px-4 py-2 ${endGameOpacity}`}>
              <h2 className="text-xl font-semibold">Tic Tac Loco</h2>
              <button
                className="px-3 py-1 border-2 border-white rounded-md hover:bg-gray-800 hover:text-white transition duration-300"
                onClick={resetGame}
              >
                Restart
              </button>
              <button
                className="px-3 py-1 border-2 border-white rounded-md hover:bg-gray-800 hover:text-white transition duration-300"
                onClick={resetGameMode}
              >
                Change player mode
              </button>
            </header>
            <section className='w-screen h-screen flex flex-col justify-center items-center'>
              <Board board={board} updateBoard={updateBoard} turn={turn} endGameOpacity={endGameOpacity} activeSquares={activeSquares} />
              <Turns turn={turn} endGameOpacity={endGameOpacity} />
              <WinnerModal winner={winner} resetGame={resetGame} />
            </section>
          </>
        )
        :
        <GameMode setIsGameModeSelected={setIsGameModeSelected} setGameMode={setGameMode}></GameMode>
      }
      {/* <RoomManager socket={socket} setRoomId={setRoomId} setConnectedRoom={setConnectedRoom} /> */}
    </main>
  )
}

export default App