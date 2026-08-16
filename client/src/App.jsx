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
import ConfirmDialog from './components/ConfirmDialog'
import { getAiMove } from './aiEngine'
import { playMark, setMuted, primeAudio } from './sound'
import { Volume2Icon, VolumeXIcon, RotateCcwIcon, ArrowLeftIcon } from 'lucide-react'
import { checkWinnerSmallBoard, checkEndGame, checkWinnerMainBoard, redirectMove } from './board'

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3000'

const createEmptyBoard = () => Array.from({ length: 9 }, () => Array(9).fill(null))

const createActiveSquares = () =>
  Array.from({ length: 9 }, () => ({
    opacity: 'opacity-100',
    disableClick: false,
    hover: 'hover:cursor-pointer',
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
  const [soundMuted, setSoundMuted] = useState(() => window.localStorage.getItem('sound-muted') === 'true')
  const [confirm, setConfirm] = useState(null)

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

  // Keep the sound module in sync with the mute setting.
  useEffect(() => {
    setMuted(soundMuted)
  }, [soundMuted])

  // Unlock audio on the first user interaction (browser autoplay policy).
  useEffect(() => {
    const unlock = () => {
      primeAudio()
      window.removeEventListener('pointerdown', unlock)
    }
    window.addEventListener('pointerdown', unlock)
    return () => window.removeEventListener('pointerdown', unlock)
  }, [])

  function toggleSound() {
    setSoundMuted((prev) => {
      const next = !prev
      window.localStorage.setItem('sound-muted', String(next))
      return next
    })
  }

  // Open a socket while in online mode; tear it down when leaving.
  useEffect(() => {
    if (gameMode !== GAME_MODES.ONLINE) return

    setOnlineStatus('connecting')
    setOnlineMessage('')
    const socket = io(SERVER_URL, { transports: ['websocket', 'polling'] })
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

    playMark(turn)

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

  // Which mark to preview (ghost) on hover — only when it's your turn to move.
  const previewMark =
    winner !== null ? null
    : gameMode === GAME_MODES.DOUBLE ? turn
    : gameMode === GAME_MODES.SINGLE ? (turn === TURNS.X ? TURNS.X : null)
    : gameMode === GAME_MODES.ONLINE ? (turn === playerSymbol ? turn : null)
    : null

  // Only warn about reset/exit when there's an in-progress board to lose.
  const boardHasMoves = board.some((sub) => (typeof sub === 'string' ? true : sub.some(Boolean)))

  function requestReset() {
    if (boardHasMoves && winner === null) {
      setConfirm({
        title: 'Reiniciar la partida',
        message: 'Se borrará el tablero actual y empezaréis de nuevo.',
        confirmLabel: 'Reiniciar',
        onConfirm: resetGame,
      })
    } else {
      resetGame()
    }
  }

  function requestExit() {
    if (boardHasMoves) {
      setConfirm({
        title: 'Salir de la partida',
        message:
          gameMode === GAME_MODES.ONLINE
            ? 'Abandonarás la partida y tu rival se quedará solo.'
            : 'Se perderá la partida actual.',
        confirmLabel: 'Salir',
        onConfirm: resetGameMode,
      })
    } else {
      resetGameMode()
    }
  }

  return (
    <main className="w-screen h-screen flex flex-col justify-center items-center">
      {isHowToPlayOpen && (
        <HowToPlay setIsHowToPlayOpen={setIsHowToPlayOpen}/>
      )}
      <ConfirmDialog
        open={!!confirm}
        title={confirm?.title}
        message={confirm?.message}
        confirmLabel={confirm?.confirmLabel}
        danger
        onConfirm={() => { confirm?.onConfirm?.(); setConfirm(null) }}
        onCancel={() => setConfirm(null)}
      />
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
            <div className="flex items-center gap-2 md:gap-3">
              <button
                className="p-1.5 rounded-full bg-transparent border-0 text-gray-300 hover:text-white hover:bg-white/10 transition duration-200"
                onClick={requestExit}
                aria-label="Salir al menú"
                title="Salir al menú"
              >
                <ArrowLeftIcon className="h-4 w-4 md:h-5 md:w-5" />
              </button>
              <h2 className="text-2xl font-semibold md:text-3xl" style={{ lineHeight: 1 }}>Tic Tac Loco</h2>
              {gameMode === GAME_MODES.SINGLE && (
                <span className="hidden sm:inline-flex items-center leading-none px-2.5 py-1 border border-gray-500 text-gray-300 rounded-full text-xs md:text-sm translate-y-[2px]">
                  {DIFFICULTY_LABELS[difficulty]}
                </span>
              )}
              {gameMode === GAME_MODES.ONLINE && (
                <span className="hidden sm:inline-flex items-center leading-none px-2.5 py-1 border border-gray-500 text-gray-300 rounded-full text-xs md:text-sm translate-y-[2px]">
                  Sala {roomId} · {playerSymbol}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {gameMode !== GAME_MODES.ONLINE && (
                <button
                  className="p-1.5 rounded-full bg-transparent border-0 text-gray-300 hover:text-white hover:bg-white/10 transition duration-200"
                  onClick={requestReset}
                  aria-label="Reiniciar partida"
                  title="Reiniciar partida"
                >
                  <RotateCcwIcon className="h-4 w-4 md:h-5 md:w-5" />
                </button>
              )}
              <button
                className="p-1.5 rounded-full bg-transparent border-0 text-gray-300 hover:text-white hover:bg-white/10 transition duration-200"
                onClick={toggleSound}
                aria-label={soundMuted ? 'Activar sonido' : 'Silenciar'}
                title={soundMuted ? 'Activar sonido' : 'Silenciar'}
              >
                {soundMuted
                  ? <VolumeXIcon className="h-4 w-4 md:h-5 md:w-5" />
                  : <Volume2Icon className="h-4 w-4 md:h-5 md:w-5" />}
              </button>
              <button
                className="p-1.5 rounded-full bg-transparent border-0 text-gray-300 hover:text-white hover:bg-white/10 transition duration-200"
                onClick={() => setIsHowToPlayOpen(true)}
                aria-label="Cómo jugar"
                title="Cómo jugar"
              >
                <span className="inline-flex items-center justify-center h-4 w-4 md:h-5 md:w-5 text-xl md:text-2xl font-bold leading-none">?</span>
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
              <Board board={board} updateBoard={updateBoard} turn={turn} endGameOpacity={endGameOpacity} activeSquares={activeSquares} gameMode={gameMode} previewMark={previewMark} />
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
