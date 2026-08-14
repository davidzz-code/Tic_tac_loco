import './App.css'
import { GAME_MODES, TURNS, DIFFICULTY, DIFFICULTY_LABELS } from './constants'
import React, { useState, useEffect, useRef, useCallback } from 'react'
import { io } from 'socket.io-client'
import Turns from './components/Turns'
import Board from './components/Board'
import GameMode from './components/GameMode'
import RoomManager from './components/RoomManager'
import confetti from 'canvas-confetti'
import WinnerModal from './components/WinnerModal'
import HowToPlay from './components/HowToPlay'
import { getAiMove } from './aiEngine'
import { checkWinnerSmallBoard, checkEndGame, checkWinnerMainBoard, redirectMove } from './board'

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3000'

const createEmptyBoard = () => Array.from({ length: 9 }, () => Array(9).fill(null))

const createActiveSquares = () =>
  Array.from({ length: 9 }, () => ({
    opacity: 'opacity-100',
    disableClick: false,
    hover: 'hover:bg-gray-700 hover:cursor-pointer',
  }))

function App() {
  const [isHowToPlayOpen, setIsHowToPlayOpen] = useState(false)
  const [board, setBoard] = useState(() => {
    try {
      const boardFromStorage = window.localStorage.getItem('board')
      return boardFromStorage ? JSON.parse(boardFromStorage) : createEmptyBoard()
    } catch (error) {
      console.error("Error parsing board from storage:", error)
      return createEmptyBoard()
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
      return activeSquareFromStorage ? JSON.parse(activeSquareFromStorage) : createActiveSquares()
    } catch (error) {
      console.error("Error parsing active squares from storage:", error)
      return createActiveSquares()
    }
  })

  const [isGameModeSelected, setIsGameModeSelected] = useState(() => {
    try {
      const gameModeFromStorage = window.localStorage.getItem('is-game-mode-selected')
      return gameModeFromStorage ? gameModeFromStorage : false
    } catch (error) {
      console.error("Error parsing game-mode from storage:", error)
      return false
    }
  })
  const [gameMode, setGameMode] = useState(() => {
    try {
      const gameModeFromStorage = window.localStorage.getItem('game-mode')
      return gameModeFromStorage ? gameModeFromStorage : ''
    } catch (error) {
      console.error("Error parsing game-mode from storage:", error)
      return ''
    }
  })
  const [difficulty, setDifficulty] = useState(() => {
    return window.localStorage.getItem('difficulty') || DIFFICULTY.MEDIUM
  })

  const [aiMove, setAiMove] = useState(null)
  const [isAiThinking, setIsAiThinking] = useState(false)
  const aiThinkingRef = useRef(false)
  const aiWorkerRef = useRef(null)
  const aiRequestIdRef = useRef(0)

  // Online multiplayer
  const socketRef = useRef(null)
  const [playerSymbol, setPlayerSymbol] = useState(null)
  const [roomId, setRoomId] = useState('')
  const [onlineStatus, setOnlineStatus] = useState('connecting') // connecting | menu | waiting | playing | ended
  const [onlineMessage, setOnlineMessage] = useState('')
  const [remoteMove, setRemoteMove] = useState(null)

  // Reset only the game board state (used locally and when the opponent resets).
  const resetLocal = useCallback(() => {
    setBoard(createEmptyBoard())
    setActiveSquares(createActiveSquares())
    setTurn(TURNS.X)
    setEndGameOpacity('opacity-100 blur-none')
    setWinner(null)
    setRemoteMove(null)
  }, [])

  // The AI search runs in a Web Worker so it never blocks the UI thread.
  useEffect(() => {
    try {
      aiWorkerRef.current = new Worker(new URL('./aiWorker.js', import.meta.url), { type: 'module' })
    } catch (error) {
      console.error('Could not start AI worker, will compute on main thread:', error)
      aiWorkerRef.current = null
    }
    return () => aiWorkerRef.current?.terminate()
  }, [])

  // Open a socket while in online mode; tear it down when leaving.
  useEffect(() => {
    if (gameMode !== GAME_MODES.ONLINE) return

    setOnlineStatus('connecting')
    setOnlineMessage('')
    const socket = io(SERVER_URL, { transports: ['websocket'] })
    socketRef.current = socket

    socket.on('connect', () => setOnlineStatus('menu'))
    socket.on('connect_error', () => setOnlineMessage('No se pudo conectar al servidor.'))
    socket.on('roomCreated', ({ roomId, symbol }) => {
      setRoomId(roomId)
      setPlayerSymbol(symbol)
      setOnlineStatus('waiting')
    })
    socket.on('roomJoined', ({ roomId, symbol }) => {
      setRoomId(roomId)
      setPlayerSymbol(symbol)
    })
    socket.on('startGame', () => {
      resetLocal()
      setOnlineStatus('playing')
    })
    socket.on('opponentMove', ({ boardIndex, squareIndex }) => setRemoteMove([boardIndex, squareIndex]))
    socket.on('opponentReset', () => resetLocal())
    socket.on('opponentLeft', () => setOnlineStatus('ended'))
    socket.on('roomError', ({ message }) => setOnlineMessage(message))

    return () => {
      socket.disconnect()
      socketRef.current = null
    }
  }, [gameMode, resetLocal])

  // The AI move is computed off the fresh board and applied here, after the
  // turn has advanced to O, so updateBoard places the AI's mark correctly.
  useEffect(() => {
    if (!aiMove) return
    updateBoard(aiMove[0], aiMove[1])
    setAiMove(null)
    aiThinkingRef.current = false
    setIsAiThinking(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aiMove])

  // Apply the opponent's move after the turn state has advanced to their symbol.
  useEffect(() => {
    if (!remoteMove) return
    updateBoard(remoteMove[0], remoteMove[1], true)
    setRemoteMove(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remoteMove])

  function scheduleAiMove(move, minThinkMs, start, requestId) {
    const remaining = Math.max(0, minThinkMs - (performance.now() - start))
    setTimeout(() => {
      if (!aiThinkingRef.current || requestId !== aiRequestIdRef.current) return
      if (move) {
        setAiMove(move)
      } else {
        aiThinkingRef.current = false
        setIsAiThinking(false)
      }
    }, remaining)
  }

  function triggerAiMove(currentBoard, forcedSub) {
    if (aiThinkingRef.current) return
    aiThinkingRef.current = true
    setIsAiThinking(true)

    const minThinkMs = 500 + Math.random() * 400
    const start = performance.now()
    const requestId = ++aiRequestIdRef.current
    const worker = aiWorkerRef.current

    if (worker) {
      const onMessage = (event) => {
        worker.removeEventListener('message', onMessage)
        if (event.data.id !== aiRequestIdRef.current) return
        scheduleAiMove(event.data.move, minThinkMs, start, requestId)
      }
      worker.addEventListener('message', onMessage)
      worker.postMessage({ board: currentBoard, forcedSub, difficulty, id: requestId })
    } else {
      setTimeout(() => {
        scheduleAiMove(getAiMove(currentBoard, forcedSub, difficulty), minThinkMs, start, requestId)
      }, 0)
    }
  }

  function resetGame() {
    resetLocal()
    setAiMove(null)
    aiThinkingRef.current = false
    aiRequestIdRef.current++
    setIsAiThinking(false)

    window.localStorage.removeItem('board')
    window.localStorage.removeItem('turn')
    window.localStorage.removeItem('active-squares')

    if (gameMode === GAME_MODES.ONLINE) {
      socketRef.current?.emit('resetGame', { roomId })
    }
  }

  function resetGameMode() {
    resetGame()
    setIsGameModeSelected(false)
    setGameMode('')
    setPlayerSymbol(null)
    setRoomId('')
    setOnlineMessage('')
    setOnlineStatus('connecting')
    window.localStorage.removeItem('game-mode')
    window.localStorage.removeItem('is-game-mode-selected')
  }

  function handleCreateRoom(code) {
    socketRef.current?.emit('createRoom', code)
  }

  function handleJoinRoom(code) {
    socketRef.current?.emit('joinRoom', code)
  }

  function updateBoard(boardIndex, squareIndex, isRemote = false) {
    if (board[boardIndex][squareIndex] || winner) return
    // Online turn lock: ignore local clicks when it isn't your turn.
    if (gameMode === GAME_MODES.ONLINE && !isRemote && turn !== playerSymbol) return

    const newBoard = [...board]
    newBoard[boardIndex] = [...newBoard[boardIndex]]
    newBoard[boardIndex][squareIndex] = turn
    setBoard(newBoard)

    const newTurn = turn === TURNS.X ? TURNS.O : TURNS.X
    setTurn(newTurn)

    const smallBoardWinner = checkWinnerSmallBoard(newBoard[boardIndex])
    let gameEnded = false

    if (smallBoardWinner) {
      newBoard[boardIndex] = smallBoardWinner
      setBoard(newBoard)

      const newWinner = checkWinnerMainBoard(newBoard)

      if (newWinner) {
        if (gameMode !== GAME_MODES.ONLINE || newWinner === playerSymbol) confetti()
        setWinner(newWinner)
        setEndGameOpacity('opacity-70 blur-sm')
        gameEnded = true
      } else if (checkEndGame(newBoard)) {
        setEndGameOpacity('opacity-70 blur-sm')
        setWinner(false)
        gameEnded = true
      }
    }
    const newActiveSquares = redirectMove(newBoard, squareIndex, activeSquares)
    setActiveSquares(newActiveSquares)

    if (gameMode !== GAME_MODES.ONLINE) {
      window.localStorage.setItem('board', JSON.stringify(newBoard))
      window.localStorage.setItem('turn', newTurn)
      window.localStorage.setItem('active-squares', JSON.stringify(newActiveSquares))
    }

    if (gameMode === GAME_MODES.SINGLE && newTurn === TURNS.O && !gameEnded) {
      triggerAiMove(newBoard, squareIndex)
    }

    if (gameMode === GAME_MODES.ONLINE && !isRemote) {
      socketRef.current?.emit('move', { roomId, boardIndex, squareIndex })
    }
  }

  const inOnlineLobby =
    gameMode === GAME_MODES.ONLINE &&
    (onlineStatus === 'connecting' || onlineStatus === 'menu' || onlineStatus === 'waiting')

  return (
    <main className="w-screen h-screen flex flex-col justify-center items-center">
      {isHowToPlayOpen && (
        <HowToPlay setIsHowToPlayOpen={setIsHowToPlayOpen}/>
      )}
      {!isGameModeSelected ? (
        <GameMode setIsGameModeSelected={setIsGameModeSelected} setGameMode={setGameMode} setIsHowToPlayOpen={setIsHowToPlayOpen} setDifficulty={setDifficulty}/>
      ) : inOnlineLobby ? (
        <RoomManager
          onlineStatus={onlineStatus}
          roomId={roomId}
          message={onlineMessage}
          onCreate={handleCreateRoom}
          onJoin={handleJoinRoom}
          onBack={resetGameMode}
        />
      ) : (
        <>
          <header className={`w-full flex justify-between items-center px-4 py-2 ${endGameOpacity}`}>
            <button
              className="bg-[#242424] hover:border hover:border-white transition duration-300 text-sm md:text-base"
              onClick={resetGameMode}
            >
              <h2 className="text-2xl font-semibold md:text-3xl">Tic Tac Loco</h2>
            </button>
            <div className="flex items-center space-x-2">
              {gameMode === GAME_MODES.SINGLE && (
                <span className="hidden sm:inline px-3 py-1 border-2 border-gray-500 text-gray-300 rounded-md text-sm md:text-base">
                  {DIFFICULTY_LABELS[difficulty]}
                </span>
              )}
              {gameMode === GAME_MODES.ONLINE && (
                <span className="hidden sm:inline px-3 py-1 border-2 border-gray-500 text-gray-300 rounded-md text-sm md:text-base">
                  Sala {roomId} · Eres {playerSymbol}
                </span>
              )}
              <button
                className="px-3 py-1 border-2 border-white rounded-md hover:bg-gray-800 hover:text-white transition duration-300 text-sm md:text-base"
                onClick={resetGame}
              >
                Reiniciar
              </button>
              <button
                className="px-3 py-1 border-2 border-white rounded-md hover:bg-gray-800 hover:text-white transition duration-300 text-sm md:text-base"
                onClick={() => setIsHowToPlayOpen(true)}
              >
                Cómo jugar
              </button>
            </div>
          </header>
          <section className="flex flex-col justify-center items-center w-full h-full">
            <div className="flex flex-col items-center w-full max-w-md md:max-w-full">
              {gameMode === GAME_MODES.ONLINE && onlineStatus === 'ended' && (
                <div className="mb-2 px-4 py-2 bg-red-500/20 border border-red-500 text-red-300 rounded-md text-sm">
                  Tu rival se ha desconectado.
                </div>
              )}
              {gameMode === GAME_MODES.ONLINE && onlineStatus === 'playing' && !winner && (
                <p className={`mb-2 text-sm font-semibold ${turn === playerSymbol ? 'text-green-400' : 'text-gray-400'}`}>
                  {turn === playerSymbol ? 'Tu turno' : 'Turno del rival…'}
                </p>
              )}
              <Board board={board} updateBoard={updateBoard} turn={turn} endGameOpacity={endGameOpacity} activeSquares={activeSquares} gameMode={gameMode} />
              <Turns turn={turn} endGameOpacity={endGameOpacity} gameMode={gameMode} isAiThinking={isAiThinking} />
              <WinnerModal winner={winner} resetGame={resetGame} />
            </div>
          </section>
        </>
      )}
    </main>
  )
}

export default App
