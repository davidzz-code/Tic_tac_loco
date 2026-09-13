import Square from "./Square";
import { TURNS } from "../constants";

// Center of a sub-board (index 0..8) as SVG coords in a 0..100 viewBox.
const subCenter = (i) => ({
  x: ((i % 3) + 0.5) / 3 * 100,
  y: (Math.floor(i / 3) + 0.5) / 3 * 100,
});

function winningLineCoords(combo) {
  const a = subCenter(combo[0]);
  const b = subCenter(combo[2]);
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len = Math.hypot(dx, dy) || 1;
  const ext = 9; // extend a bit past the end sub-boards for a strike-through look
  const ux = (dx / len) * ext;
  const uy = (dy / len) * ext;
  return { x1: a.x - ux, y1: a.y - uy, x2: b.x + ux, y2: b.y + uy };
}

export default function Board({ board, updateBoard, endGameOpacity, activeSquares, gameMode, turn, previewMark, winningLine, winner }) {
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

  const lineColor = winner === TURNS.O ? '#3b82f6' : '#ef4444'
  const line = winningLine ? winningLineCoords(winningLine) : null

  return (
    <section
      className={`relative grid grid-cols-3 ${endGameOpacity} mx-auto w-full max-w-[600px] aspect-square`}
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
                  gameMode={gameMode}
                  turn={turn}
                  animateMark
                  previewMark={previewMark}
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
                  style=''
                  gameMode = { gameMode }
                  turn = { turn }
                  animateMark
                >
                  {smallBoard}
                </Square>
              )
          }
        </div>
      ))}
      {line && (
        <svg
          className="pointer-events-none absolute inset-0 w-full h-full z-20"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          <line
            x1={line.x1} y1={line.y1} x2={line.x2} y2={line.y2}
            stroke={lineColor}
            strokeWidth="3"
            strokeLinecap="round"
            pathLength="1"
            className="winning-line"
          />
        </svg>
      )}
    </section>
  );
}
