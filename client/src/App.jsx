import './App.css'
import { GAME_MODES, TURNS } from './constants'
import React, {useState, useEffect} from 'react'
import Turns from './components/Turns'
import Board from './components/Board'
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

  const [isGameModeSelected, setIsGameModeSelected] = useState(false)
  const [gameMode, setGameMode] = useState(() => {
    try {
      const gameModeFromStorage = window.localStorage.getItem('game-mode')
      return gameModeFromStorage ? gameModeFromStorage : ''
    } catch (error) {
      console.error("Error parsing game-mode from storage:", error)
      return ''
    }
  })
  const [chatResponse, setChatResponse] = useState(null);

  let isAIProcessing = false

  async function sendBoardToChatGPT(newBoard, userBoardIndex, userSquareIndex) {
    if (isAIProcessing) return
    isAIProcessing = true
  
    try {
      const response = await fetch('https://tic-tac-loco-backend.vercel.app/process-board', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ newBoard, userBoardIndex, userSquareIndex }),
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
  
      const data = await response.json()
      return data?.chatBoard
  
    } catch (error) {
      console.error('Error sending the board to the server on /process-board:', error)
    } finally {
      isAIProcessing = false
    }
  }

    // La función para enviar el tablero
    async function handleSendBoard(newBoard, userBoardIndex, userSquareIndex) {
      const response = await sendBoardToChatGPT(newBoard, userBoardIndex, userSquareIndex);
      setChatResponse(response)
    }
  
    useEffect(() => {
      if (chatResponse) {
        // Aquí puedes actualizar el tablero con la respuesta de ChatGPT
        updateBoard(chatResponse[0], chatResponse[1])
      }
    }, [chatResponse])
  
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

  }
  
  function resetGameMode() {
    resetGame()
    setIsGameModeSelected(false)
    setGameMode('')
    window.localStorage.removeItem('game-mode')
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

    if (gameMode === GAME_MODES.SINGLE && newTurn === TURNS.O) {
      handleSendBoard(newBoard, boardIndex, squareIndex);
    }
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
    </main>
  )
}

export default App