import Square from "./Square";
import { TURNS } from '../constants'

export default function Board({ board, updateBoard, winnerOpacity, turn }) {
  // const customStyle = turn === TURNS.X ? 'text-[#EF4444] ' : 'text-[#3B82F6]'
  
  return (
    <section
      className={`grid grid-cols-3 border-2 border-gray-200 ${winnerOpacity} mx-auto w-full max-w-[600px] aspect-square`}
    >
      {board.map((_, index) => (
        <Square key={index} index={index} updateBoard={updateBoard} >
          {board[index]}
        </Square>
      ))}
    </section>
  );
}
