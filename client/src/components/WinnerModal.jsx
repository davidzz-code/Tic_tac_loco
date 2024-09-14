import Square from "./Square"

export default function WinnerModal({ winner, resetGame }) {
  if (winner === null) return null

  const winnerText = winner === false ? 'Draw' : `The winner is:`

  return (
    <section className="absolute flex justify-center items-center">
      <div className="w-96 h-96 flex flex-col justify-between items-center bg-blue-900">
        <h2 className="mt-16 text-3xl">{winnerText}</h2>
        <header>
          {winner && <Square style="hover:bg-inherit my-4">{winner}</Square>}
        </header>
        <footer className="w-full flex justify-center p-3">
          <button onClick={resetGame}>Restart</button>
        </footer>
      </div>
    </section>
  )
}