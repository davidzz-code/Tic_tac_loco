import { getAiMove } from './aiEngine'

// Runs the minimax search off the main thread so the UI never freezes.
self.onmessage = (event) => {
  const { board, forcedSub, difficulty, id } = event.data
  const move = getAiMove(board, forcedSub, difficulty)
  self.postMessage({ move, id })
}
