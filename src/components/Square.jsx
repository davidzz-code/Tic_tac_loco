export default function Square({children, index, updateBoard, isSelected, style}) {
  const className = isSelected ? 'bg-blue-600 hover:bg-blue-600' : ''

  function handleClick() {
    updateBoard(index)
  }
  return (
    <div
      className={`aspect-square flex justify-center items-center text-6xl border-2 border-gray-200 hover:bg-gray-700 hover:cursor-pointer rounded-none hover:border-gray-200 ${style} ${className}`}
      onClick={handleClick}
    >{children}</div>
  )
} 