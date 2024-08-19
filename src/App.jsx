import React, {useState} from 'react'
import Square from './components/Square'
import './App.css'
const TURNS = {
  X: 'x',
  O: 'o',
}

function App() {
  const [board, setBoard] = useState(Array(9).fill(null))
  const [turn, setTurn] = useState(TURNS.X)

  function updateBoard() {
    setTurn(prevTurn => prevTurn === TURNS.X ? TURNS.O : TURNS.X)
  }

  return (
    <main className='w-screen h-screen flex flex-col justify-center items-center'>
      <section className="grid grid-cols-3 w-[600px] h-[600px] border-2 border-gray-200">
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
      <section className="m-4 flex h-16">
        <Square style="p-3 text-6xl border-none m-2" isSelected={turn === TURNS.X}>{TURNS.X}</Square>
        <Square style="p-3 text-6xl border-none m-2" isSelected={turn === TURNS.O}>{TURNS.O}</Square>
      </section>
    </main>
  )
}

export default App
