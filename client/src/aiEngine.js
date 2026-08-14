import { TURNS, WINNER_COMBOS } from './constants'

const HUMAN = TURNS.X
const AI = TURNS.O
const WIN = 1_000_000
const DRAW = 'draw'

// Positional weight: center is most valuable, then corners, then edges.
const POS_WEIGHT = [3, 2, 3, 2, 4, 2, 3, 2, 3]

// Per-difficulty search configuration.
//  - maxDepth:   how many plies minimax looks ahead (capped by timeBudget)
//  - timeBudget: soft time limit in ms for iterative deepening
//  - randomness: probability of playing a random legal move (adds "mistakes")
export const AI_LEVELS = {
  easy: { maxDepth: 2, timeBudget: 120, randomness: 0.4 },
  medium: { maxDepth: 5, timeBudget: 350, randomness: 0.05 },
  hard: { maxDepth: 9, timeBudget: 900, randomness: 0 },
}

function winnerOfSub(cells) {
  for (const [a, b, c] of WINNER_COMBOS) {
    if (cells[a] && cells[a] === cells[b] && cells[a] === cells[c]) return cells[a]
  }
  return null
}

function mainWinner(owners) {
  for (const [a, b, c] of WINNER_COMBOS) {
    const v = owners[a]
    if (v && v !== DRAW && v === owners[b] && v === owners[c]) return v
  }
  return null
}

// Convert the app board (mix of arrays and won-markers) into a search state.
function toState(board) {
  const cells = []
  const owners = []
  for (let i = 0; i < 9; i++) {
    const sub = board[i]
    if (typeof sub === 'string') {
      owners[i] = sub
      cells[i] = Array(9).fill(null)
    } else {
      cells[i] = sub.slice()
      const w = winnerOfSub(cells[i])
      if (w) owners[i] = w
      else if (cells[i].every((c) => c !== null)) owners[i] = DRAW
      else owners[i] = null
    }
  }
  return { cells, owners }
}

// A sub-board is playable only if it has no owner (not won, not full).
const isPlayable = (owners, i) => owners[i] === null

function legalMoves(state, forcedSub) {
  const { cells, owners } = state
  let subs
  if (forcedSub >= 0 && isPlayable(owners, forcedSub)) {
    subs = [forcedSub]
  } else {
    subs = []
    for (let i = 0; i < 9; i++) if (isPlayable(owners, i)) subs.push(i)
  }
  const moves = []
  for (const s of subs) {
    for (let p = 0; p < 9; p++) if (cells[s][p] === null) moves.push([s, p])
  }
  return moves
}

function orderMoves(moves) {
  return moves.sort(
    (m1, m2) => POS_WEIGHT[m1[0]] + POS_WEIGHT[m1[1]] - (POS_WEIGHT[m2[0]] + POS_WEIGHT[m2[1]])
  ).reverse()
}

function applyMove(state, s, p, player) {
  const prevOwner = state.owners[s]
  state.cells[s][p] = player
  const w = winnerOfSub(state.cells[s])
  if (w) state.owners[s] = w
  else if (state.cells[s].every((c) => c !== null)) state.owners[s] = DRAW
  return { s, p, prevOwner }
}

function undoMove(state, undo) {
  state.cells[undo.s][undo.p] = null
  state.owners[undo.s] = undo.prevOwner
}

// After moving in cell p, the opponent is forced into sub-board p, unless
// that sub-board is already decided (then they play anywhere): -1 = free.
const nextForced = (state, p) => (isPlayable(state.owners, p) ? p : -1)

// Score a line of three sub-boards from the AI's perspective.
function lineScore(a, b, c, target) {
  let ai = 0
  let human = 0
  for (const v of [a, b, c]) {
    if (v === AI) ai++
    else if (v === HUMAN) human++
  }
  if (ai > 0 && human > 0) return 0 // contested line, dead
  const count = ai > 0 ? ai : human
  const value = count === 2 ? 30 : count === 1 ? 6 : 0
  return ai > 0 ? value : -value
}

function evaluate(state) {
  const { cells, owners } = state
  let score = 0

  // Owning sub-boards, weighted by their position on the main board.
  for (let i = 0; i < 9; i++) {
    if (owners[i] === AI) score += POS_WEIGHT[i] * 10
    else if (owners[i] === HUMAN) score -= POS_WEIGHT[i] * 10
  }

  // Progress toward winning lines on the main board.
  for (const [a, b, c] of WINNER_COMBOS) {
    score += lineScore(owners[a], owners[b], owners[c])
  }

  // Light bonus for controlling the center cell of playable sub-boards.
  for (let i = 0; i < 9; i++) {
    if (!isPlayable(owners, i)) continue
    if (cells[i][4] === AI) score += 2
    else if (cells[i][4] === HUMAN) score -= 2
  }

  return score
}

function minimax(state, forcedSub, depth, alpha, beta, player, deadline) {
  const mw = mainWinner(state.owners)
  if (mw === AI) return WIN + depth
  if (mw === HUMAN) return -(WIN + depth)

  const moves = legalMoves(state, forcedSub)
  if (moves.length === 0) return 0
  if (depth === 0) return evaluate(state)
  if (performance.now() > deadline) throw deadline

  orderMoves(moves)
  const maximizing = player === AI
  let value = maximizing ? -Infinity : Infinity

  for (const [s, p] of moves) {
    const undo = applyMove(state, s, p, player)
    const child = minimax(state, nextForced(state, p), depth - 1, alpha, beta, maximizing ? HUMAN : AI, deadline)
    undoMove(state, undo)

    if (maximizing) {
      value = Math.max(value, child)
      alpha = Math.max(alpha, value)
    } else {
      value = Math.min(value, child)
      beta = Math.min(beta, value)
    }
    if (alpha >= beta) break
  }
  return value
}

function searchRoot(state, forcedSub, depth, deadline) {
  const moves = orderMoves(legalMoves(state, forcedSub))
  let bestMove = moves[0]
  let bestScore = -Infinity
  let alpha = -Infinity

  for (const [s, p] of moves) {
    const undo = applyMove(state, s, p, AI)
    const score = minimax(state, nextForced(state, p), depth - 1, alpha, Infinity, HUMAN, deadline)
    undoMove(state, undo)
    if (score > bestScore) {
      bestScore = score
      bestMove = [s, p]
    }
    alpha = Math.max(alpha, bestScore)
  }
  return { move: bestMove, score: bestScore }
}

/**
 * Choose the AI's move.
 * @param {Array} board       app board (arrays + won-markers)
 * @param {number} forcedSub  sub-board the AI is sent to (last human squareIndex)
 * @param {string} difficulty 'easy' | 'medium' | 'hard'
 * @returns {[number, number] | null} [subBoardIndex, positionIndex]
 */
export function getAiMove(board, forcedSub, difficulty = 'medium') {
  const cfg = AI_LEVELS[difficulty] || AI_LEVELS.medium
  const state = toState(board)
  const moves = legalMoves(state, forcedSub)

  if (moves.length === 0) return null
  if (moves.length === 1) return moves[0]

  if (cfg.randomness > 0 && Math.random() < cfg.randomness) {
    return moves[Math.floor(Math.random() * moves.length)]
  }

  const deadline = performance.now() + cfg.timeBudget
  let best = moves[0]

  // Iterative deepening: keep the best move from the last fully searched depth.
  for (let depth = 1; depth <= cfg.maxDepth; depth++) {
    try {
      best = searchRoot(state, forcedSub, depth, deadline).move
    } catch {
      break // time budget exceeded mid-search; keep previous depth's result
    }
    if (performance.now() > deadline) break
  }

  return best
}
