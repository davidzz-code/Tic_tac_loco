import Square from "./Square"
import { useI18n } from "../i18n/i18n"

export default function WinnerModal({ winner, resetGame }) {
  const { t } = useI18n()
  if (winner === null) return null

  const winnerText = winner === false ? t('game.draw') : t('game.winnerIs')

  return (
    <section className="absolute flex justify-center items-center">
      <div className="w-96 py-8 flex flex-col justify-between items-center bg-[#343434] rounded-md border-2 border-white">
        <header className="flex items-center gap-x-4">
          <h2 className="text-3xl text-white">{winnerText}</h2>
          {winner && <Square style="hover:bg-inherit my-4 w-20 h-20" animateMark>{winner}</Square>}
        </header>
        <footer className="w-full mt-8 flex justify-center">
          <button
            className="px-3 py-1 border-2 bg-inherit text-white border-white rounded-md transition duration-300"
            onClick={resetGame}>{t('game.playAgain')}</button>
        </footer>
      </div>
    </section>
  )
}
