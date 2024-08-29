import Square from "./Square"

export default function Board({ board, updateBoard, winnerOpacity }) {
  return (
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
  )
}