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

// Like checkWinnerMainBoard but also returns which three sub-boards won,
// so we can draw the winning line. Returns { mark, combo } or null.
export function findMainWinner(boardToCheck) {
  for (const combo of WINNER_COMBOS) {
    const [a, b, c] = combo
    const valueA = boardToCheck[a]
    if (
      valueA &&
      !Array.isArray(valueA) &&
      valueA === boardToCheck[b] &&
      valueA === boardToCheck[c]
    ) {
      return { mark: valueA, combo }
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
    opacity: 'opacity-25',
    disableClick: true,
    hover: '',
  }
  
  const activeSquaresStyle = {
    opacity: 'opacity-100',
    disableClick: false,
    hover: 'hover:cursor-pointer',
  }

  return activeSquares.map((_, index) => {
    if (!Array.isArray(newBoard[squareIndex])) {
      return activeSquaresStyle
    }
    return index === squareIndex ? activeSquaresStyle : disabledSquaresStyle
  })
}