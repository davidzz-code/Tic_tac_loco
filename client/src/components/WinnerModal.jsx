import Square from "./Square"

export default function WinnerModal({ winner, resetGame }) {
  if (winner === null) return null

  const winnerText = winner === false ? 'Empate' : `El ganador es:`

  return (
    <section className="absolute flex justify-center items-center">
      <div className="w-96 py-8 flex flex-col justify-between items-center bg-[#242424] rounded-md border-2 border-white">
        <header className="flex items-center gap-x-4">
          <h2 className="text-3xl text-white">{winnerText}</h2>
          {winner && <Square style="hover:bg-inherit my-4">{winner}</Square>}
        </header>
        <footer className="w-full mt-8 flex justify-center">
          <button
            className="px-3 py-1 border-2 bg-inherit text-white border-white rounded-md transition duration-300"
            onClick={resetGame}>Reinicar</button>
        </footer>
      </div>
    </section>
  )
}