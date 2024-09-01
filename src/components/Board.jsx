import Square from "./Square";

export default function Board({ board, updateBoard, endGameOpacity }) {
  const getSquareStyle = (index) => {
    if (index === 4) return 'border-2 border-4ray-200'
    if (index === 1 || index === 7) return 'border-x-2 border-gray-200'
    if (index === 3 || index === 5) return 'border-y-2 border-gray-200'
    return 'border-2 border-transparent'
  }

  const getBoardStyle = (index) => {
    let borderStyle = 'border-4 border-yellow-600'
    if (index % 3 === 0) borderStyle += ' border-l-0'
    if (index % 3 === 2) borderStyle += ' border-r-0'
    if (Math.floor(index / 3) === 0) borderStyle += ' border-t-0'
    if (Math.floor(index / 3) === 2) borderStyle += ' border-b-0'
    return borderStyle
  };
  
  return (
    <section
      className={`grid grid-cols-3 ${endGameOpacity} mx-auto w-full max-w-[600px] aspect-square`}
      >
      {board.map((smallBoard, boardIndex) => (
        <div key={boardIndex} className={`grid grid-cols-3 ${getBoardStyle(boardIndex)} aspect-square p-4`}>
          {
            Array.isArray(smallBoard) ?
              smallBoard.map((square, squareIndex) => (
                <Square
                  key={squareIndex}
                  boardIndex={boardIndex}
                  squareIndex={squareIndex}
                  updateBoard={updateBoard}
                  disableClick={false}
                  style={`hover:bg-gray-700 hover:cursor-pointer ${getSquareStyle(squareIndex)}`}
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
                  style='text-9xl'
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
