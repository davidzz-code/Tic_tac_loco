import { GAME_MODES, TURNS } from '../constants'

export default function Square({ children, boardIndex, squareIndex, updateBoard, isSelected, disableClick = true, style, opacity = 'opacity-100', gameMode, turn }) {
  const selectedStyle = isSelected ? '' : `${opacity}`

    const getColor = (value) => {
      if (value === TURNS.X) return 'text-red-500'
      if (value === TURNS.O) return 'text-blue-500'
      return ''
    };
  function handleClick() {
    if (!disableClick) {
      if (gameMode === GAME_MODES.SINGLE && turn === TURNS.O) return
      updateBoard(boardIndex, squareIndex)
    }
  }
  return (
    <div
      className={`${getColor(children)} h-full font-bold aspect-square flex justify-center items-center text-5xl rounded-none ${style} ${selectedStyle}`}
      onClick={handleClick}
    >{children}</div>
  )
} 