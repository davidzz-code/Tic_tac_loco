import { TURNS, WINNER_COMBOS } from "./constants";

export function checkWinnerSmallBoard(boardToCheck) {
  for (const combo of WINNER_COMBOS) {
    const [a, b, c] = combo
    if (
      boardToCheck[a] &&
      boardToCheck[a] === boardToCheck[b] &&
      boardToCheck[a] === boardToCheck[c]
    )
    {
      return boardToCheck[a]
    }
  }
  return null
}

export function checkWinnerMainBoard(boardToCheck) {
  for (const combo of WINNER_COMBOS) {
    const [a, b, c] = combo

    const valueA = boardToCheck[a]
    const valueB = boardToCheck[b]
    const valueC = boardToCheck[c]
    if (
      valueA &&
      !Array.isArray(valueA) &&
      valueA === valueB &&
      valueA === valueC
    )
    {
      return valueA
    }
  }
  return null
}

export function checkEndGame(boardToCheck) {
  for (const smallBoard of boardToCheck) {
    if (Array.isArray(smallBoard)) return false
  }
  return true
}

export function redirectMove(newBoard, squareIndex, activeSquares) {
  const disabledSquaresStyle = {
    opacity: 'opacity-50',
    disableClick: true,
    hover: '',
  }
  
  const activeSquaresStyle = {
    opacity: 'opacity-100',
    disableClick: false,
    hover: 'hover:bg-gray-700 hover:cursor-pointer',
  }

  return activeSquares.map((item, index) => {
    if (!Array.isArray(newBoard[squareIndex])) {
      return activeSquaresStyle
    }
    return index === squareIndex ? activeSquaresStyle : disabledSquaresStyle
  })
}