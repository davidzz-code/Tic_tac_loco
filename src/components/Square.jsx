export default function Square({children, updateBoard, isSelected, style}) {
  const className = isSelected ? 'bg-blue-600' : ''

  function handleClick() {
    updateBoard()
  }
  return (
    <div
      className={`w-full h-full flex justify-center items-center text-8xl border-2 border-gray-200 hover:bg-gray-700 hover:cursor-pointer rounded-none hover:border-gray-200 ${className} ${style}`}
      onClick={handleClick}
    >{children}</div>
  )
} 