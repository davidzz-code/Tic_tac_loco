function isSubBoardWon(newBoard, userSquareIndex) {
  return newBoard[userSquareIndex].length > 0 && typeof newBoard[userSquareIndex] === 'string'
}

function getValidPositionInSubBoard(newBoard, subBoardIndex) {
  const validPosition = findRandomValidPosition(newBoard, subBoardIndex)
  
  if (validPosition !== null) {
    console.log(`Eligiendo posición válida: ${validPosition} en el sub-tablero ${subBoardIndex}`)
    return [subBoardIndex, validPosition]
  } else {
    console.error('No hay posiciones válidas disponibles en el sub-tablero')
    return null
  }
}

function findRandomValidPosition(board, subBoardIndex) {
  const subBoard = board[subBoardIndex]
  const validPositions = []

  for (let i = 0; i < subBoard.length; i++) {
    if (subBoard[i] === null) {
      validPositions.push(i)
    }
  }

  if (validPositions.length > 0) {
    const randomIndex = Math.floor(Math.random() * validPositions.length)
    return validPositions[randomIndex]
  }

  return null
}

export function validateAiMove(newBoard, chatBoard, userSquareIndex) {
  const [subBoardIndex, positionIndex] = chatBoard

  if (isSubBoardWon(newBoard, userSquareIndex)) {
    return getValidPositionInSubBoard(newBoard, subBoardIndex)
  }

  if (userSquareIndex !== subBoardIndex) {
    return getValidPositionInSubBoard(newBoard, userSquareIndex)
  }

  if (newBoard[subBoardIndex][positionIndex] !== null) {
    return getValidPositionInSubBoard(newBoard, subBoardIndex)
  }

  return chatBoard
}

export function getWonSubboards(board) {
  const wonBoards = []
  board.forEach((subBoard, index) => {
    if (typeof subBoard === 'string') {
      wonBoards.push(index)
    }
  })
  return wonBoards.length > 0 ? wonBoards.join(', ') : 'none'
}