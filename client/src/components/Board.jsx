import Square from "./Square";

export default function Board({ board, updateBoard, endGameOpacity, activeSquares }) {
  const getSquareStyle = (index) => {
    if (index === 4) return 'border-2 border-gray-200'
    if (index === 1 || index === 7) return 'border-x-2 border-gray-200'
    if (index === 3 || index === 5) return 'border-y-2 border-gray-200'
    return 'border-2 border-transparent'
  }

  const getBoardStyle = (index) => {
    let borderStyle = 'border-4 border-yellow-600'
    if (index % 3 === 0) borderStyle += ' border-l-transparent'
    if (index % 3 === 2) borderStyle += ' border-r-transparent'
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
                  disableClick={activeSquares[boardIndex].disableClick}
                  style={`${activeSquares[boardIndex].opacity} ${activeSquares[boardIndex].hover} ${getSquareStyle(squareIndex)}`}
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
