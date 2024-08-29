import React, {useState} from 'react'
import Square from './components/Square'
import confetti from 'canvas-confetti'
import {TURNS, WINNER_COMBOS} from './constants'
import './App.css'


function App() {
  const [board, setBoard] = useState(Array(9).fill(null))
  const [turn, setTurn] = useState(TURNS.X)
  const [winner, setWinner] = useState(null)
  const winnerOpacity = winner || board.every(square => square !== null) ? 'opacity-50 blur-sm' : null

  function checkEndGame(newBoard) {
    return newBoard.every(square => square !== null)
  }

  function updateBoard(index) {
    
    if (board[index] || winner) return
    
    const newBoard = [...board]
    newBoard[index] = turn
    setBoard(newBoard)

    const newTurn = turn === TURNS.X ? TURNS.O : TURNS.X
    setTurn(newTurn)
    const newWinner = checkWinner(newBoard)

    if (newWinner) {
      confetti()
      setWinner(newWinner)
    } else if(checkEndGame(newBoard)) {
      setWinner(false)
    }
    
    // TODO: Check if game is over
  }

  function checkWinner(boardToCheck) {
    for (const combo of WINNER_COMBOS) {
      const [a, b, c] = combo
      console.log(a, b, c)
      if (
        boardToCheck[a] &&
        boardToCheck[a] === boardToCheck[b] &&
        boardToCheck[a] === boardToCheck[c]
      )
      {
        return boardToCheck[a]
      }
    }
    return null
  }
  function resetGame() {
    setWinner(null)
    setTurn(prevTurn => prevTurn === TURNS.X ? TURNS.X : TURNS.O)
    setBoard(Array(9).fill(null))
  }

  return (
    <main className='w-screen h-screen flex flex-col justify-center items-center'>
      <header className={`flex flex-col justify-center items-center ${winnerOpacity}`}>
        <h1>Tic Tac Loco</h1>
        <button className="my-5 border-white bg-inherit" onClick={resetGame}>Empezar de nuevo</button>
      </header>
      <section className={`grid grid-cols-3 w-[400px] h-[400px] border-2 border-gray-200 ${winnerOpacity}`}>
        {
          board.map((_, index) => {
            return (
              <Square
                key={index}
                index={index}
                updateBoard={updateBoard}
              >
                {board[index]}
              </Square>
            )
          })
        }
      </section>
      <section className={`m-4 flex justify-center items-center space-x-4 h-16 ${winnerOpacity}`}>
        <Square style="w-16 h-16 flex items-center justify-center text-5xl border-none rounded-md hover:bg-inherit" isSelected={turn === TURNS.X}>
          {TURNS.X}
        </Square>
        <Square style="w-16 h-16 flex items-center justify-center text-5xl border-none rounded-md hover:bg-inherit" isSelected={turn === TURNS.O}>
          {TURNS.O}
        </Square>
      </section>
      {
        winner !== null && (
          <section className="w-screen h-screen absolute flex justify-center items-center">
            <div className="px-28 py-10 bg-blue-900">
              <h2 className="text-3xl">
                {
                  winner === false
                    ? 'Empate'
                    : 'Ganó:'
                }
              </h2>
              <header>
                {winner && <Square style="hover:bg-inherit my-4">{winner}</Square>}
              </header>
              <footer>
                <button onClick={resetGame}>Empezar de nuevo</button>
              </footer>
            </div>
          </section>
        )
      }
    </main>
  )
}

export default App
