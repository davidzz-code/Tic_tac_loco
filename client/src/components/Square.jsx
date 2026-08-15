import { GAME_MODES, TURNS } from '../constants'
import Mark from './Mark'

export default function Square({ children, boardIndex, squareIndex, updateBoard, isSelected, disableClick = true, style, opacity = 'opacity-100', gameMode, turn, animateMark = false, previewMark = null }) {
  const selectedStyle = isSelected ? '' : `${opacity}`
  const showGhost = !children && previewMark && !disableClick

  function handleClick() {
    if (!disableClick) {
      if (gameMode === GAME_MODES.SINGLE && turn === TURNS.O) return
      updateBoard(boardIndex, squareIndex)
    }
  }
  return (
    <div
      className={`group h-full font-bold aspect-square flex justify-center items-center rounded-none ${style} ${selectedStyle}`}
      onClick={handleClick}
    >
      {children ? (
        <Mark value={children} animate={animateMark} />
      ) : showGhost ? (
        <Mark value={previewMark} className="opacity-0 group-hover:opacity-30 transition-opacity duration-150" />
      ) : null}
    </div>
  );
}