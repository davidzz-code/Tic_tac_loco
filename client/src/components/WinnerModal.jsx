import Square from "./Square"

export default function WinnerModal({ winner, resetGame }) {
  if (winner === null) return null

  const winnerText = winner === false ? 'Draw' : `The winner is:`

  return (
    <section className="absolute flex justify-center items-center">
      <div className="w-96 py-8 flex flex-col justify-between items-center bg-gray-300">
        <header className="flex items-center gap-x-4">
          <h2 className="text-3xl text-black">{winnerText}</h2>
          {winner && <Square style="hover:bg-inherit my-4">{winner}</Square>}
        </header>
        <footer className="w-full mt-8 flex justify-center">
          <button
            className="px-3 py-1 border-2 bg-inherit text-black border-black rounded-md hover:bg-gray-800 hover:text-white hover:border-gray-800 transition duration-300"
            onClick={resetGame}>Restart</button>
        </footer>
      </div>
    </section>
  )
}