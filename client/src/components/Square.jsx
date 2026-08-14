import { GAME_MODES, TURNS } from '../constants'
import Mark from './Mark'

export default function Square({ children, boardIndex, squareIndex, updateBoard, isSelected, disableClick = true, style, opacity = 'opacity-100', gameMode, turn, animateMark = false }) {
  const selectedStyle = isSelected ? '' : `${opacity}`

  function handleClick() {
    if (!disableClick) {
      if (gameMode === GAME_MODES.SINGLE && turn === TURNS.O) return
      updateBoard(boardIndex, squareIndex)
    }
  }
  return (
    <div
      className={`h-full font-bold aspect-square flex justify-center items-center rounded-none ${style} ${selectedStyle}`}
      onClick={handleClick}
    >
      <Mark value={children} animate={animateMark} />
    </div>
  );
}