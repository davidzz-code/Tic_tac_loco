import Square from "./Square";

export default function Board({ board, updateBoard, winnerOpacity }) {

  return (
    <section
      className={`grid grid-cols-3 border-2 border-gray-200 ${winnerOpacity} mx-auto w-full max-w-[600px] aspect-square`}
    >
      {board.map((smallBoard, boardIndex) => (
        <div key={boardIndex} className="grid grid-cols-3">
          {
            Array.isArray(smallBoard) ?
              smallBoard.map((square, squareIndex) => (
                <Square
                  key={squareIndex}
                  boardIndex={boardIndex}
                  squareIndex={squareIndex}
                  updateBoard={updateBoard}
                  disableClick={false}
                  style='hover:bg-gray-700 hover:cursor-pointer'
                >
                  {square}
                </Square>
              )) :
              (
                <Square
                  key={boardIndex}
                  boardIndex={boardIndex}
                  updateBoard={updateBoard}
                  disableClick={true}
                  style='h-full text-8xl'
                >
                  {smallBoard}
                </Square>
              )
          }
        </div>
      ))}
    </section>
  );
}
