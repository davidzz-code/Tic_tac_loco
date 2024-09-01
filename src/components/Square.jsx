import { TURNS } from '../constants'

export default function Square({ children, boardIndex, squareIndex, updateBoard, isSelected, disableClick, style, opacity = 'opacity-100' }) {
  const selectedStyle = isSelected ? '' : `${opacity}`

    const getColor = (value) => {
      if (value === TURNS.X) return 'text-red-500'
      if (value === TURNS.O) return 'text-blue-500'
      return ''
    };
  function handleClick() {
    if (!disableClick) {
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