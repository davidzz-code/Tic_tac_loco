import { TURNS } from '../constants'

export default function Square({ children, index, updateBoard, isSelected, style, turn }) {
  const className = isSelected ? 'bg-[#F2F2F2]' : ''

    const getColor = (value) => {
      if (value === TURNS.X) return "text-red-500"; // Color para X
      if (value === TURNS.O) return "text-blue-500"; // Color para O
      return ""; // Sin color para celdas vacías
    };
  function handleClick() {
    updateBoard(index)
  }
  return (
    <div
      className={`${getColor(children)} font-bold aspect-square flex justify-center items-center text-6xl border-2 border-gray-200 hover:bg-gray-700 hover:cursor-pointer rounded-none hover:border-gray-200 ${style} ${className}`}
      onClick={handleClick}
    >{children}</div>
  )
} 