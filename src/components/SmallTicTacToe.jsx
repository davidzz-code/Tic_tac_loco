import React from 'react'
import Turns from './Turns'
import Board from './Board'
import WinnerModal from './WinnerModal'
import confetti from 'canvas-confetti'
import { TURNS } from '../constants'
import { checkWinnerFrom, checkEndGame } from '../board'


export default function SmallTicTacToe({board, turn, winner, setBoard, setTurn, setWinner, resetGame, winnerOpacity}) {

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

  return (
    <section className='w-screen h-screen flex flex-col justify-center items-center'>
      <Board board={board} updateBoard={updateBoard} turn={turn} winnerOpacity={winnerOpacity}/>
      <Turns turn={turn} winnerOpacity={winnerOpacity} />
      <WinnerModal winner={winner} resetGame={resetGame} />
    </section>
  )
}
