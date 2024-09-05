import Square from "./Square"

export default function WinnerModal({ winner, resetGame }) {
  if (winner === null) return null

  const winnerText = winner === false ? 'Draw' : `The winner is:`

  return (
    <section className="absolute flex justify-center items-center">
      <div className="px-28 py-10 bg-blue-900">
        <h2 className="text-3xl">{winnerText}</h2>
        <header>
          {winner && <Square style="hover:bg-inherit my-4">{winner}</Square>}
        </header>
        <footer>
          <button onClick={resetGame}>Restart</button>
        </footer>
      </div>
    </section>
  )
}