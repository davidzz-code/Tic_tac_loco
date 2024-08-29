import Square from "./Square";

export default function Board({ board, updateBoard, winnerOpacity }) {
  return (
    <section
      className={`grid grid-cols-3 border-2 border-gray-200 ${winnerOpacity} mx-auto w-full max-w-[600px] aspect-square`}
    >
      {board.map((_, index) => (
        <Square key={index} index={index} updateBoard={updateBoard}>
          {board[index]}
        </Square>
      ))}
    </section>
  );
}
