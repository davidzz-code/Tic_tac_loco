import { Server } from 'socket.io'
import { createServer } from 'node:http'
import dotenv from 'dotenv'
import express from 'express'
import cors from 'cors'

dotenv.config()
const port = process.env.PORT ?? 3000

const app = express()
app.use(express.json())
app.use(cors({ origin: '*', methods: ['GET', 'POST'] }))

app.get('/', (req, res) => {
  res.send('Tic Tac Loco server is running')
})

const server = createServer(app)

const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] },
})

const HOST_SYMBOL = '✕'
const GUEST_SYMBOL = '○'

// roomId -> { players: string[] }
const rooms = new Map()

function leaveRoom(socket) {
  const roomId = socket.data.roomId
  if (!roomId) return

  const room = rooms.get(roomId)
  if (room) {
    room.players = room.players.filter((id) => id !== socket.id)
    socket.to(roomId).emit('opponentLeft')
    if (room.players.length === 0) rooms.delete(roomId)
  }
  socket.leave(roomId)
  socket.data.roomId = null
}

io.on('connection', (socket) => {
  socket.on('createRoom', (roomId) => {
    if (rooms.has(roomId)) {
      socket.emit('roomError', { message: 'Esa sala ya existe, prueba otra.' })
      return
    }
    rooms.set(roomId, { players: [socket.id] })
    socket.join(roomId)
    socket.data.roomId = roomId
    socket.emit('roomCreated', { roomId, symbol: HOST_SYMBOL })
  })

  socket.on('joinRoom', (roomId) => {
    const room = rooms.get(roomId)
    if (!room) {
      socket.emit('roomError', { message: 'La sala no existe.' })
      return
    }
    if (room.players.length >= 2) {
      socket.emit('roomError', { message: 'La sala está llena.' })
      return
    }
    room.players.push(socket.id)
    socket.join(roomId)
    socket.data.roomId = roomId
    socket.emit('roomJoined', { roomId, symbol: GUEST_SYMBOL })
    io.to(roomId).emit('startGame')
  })

  socket.on('move', ({ roomId, boardIndex, squareIndex }) => {
    socket.to(roomId).emit('opponentMove', { boardIndex, squareIndex })
  })

  socket.on('resetGame', ({ roomId }) => {
    socket.to(roomId).emit('opponentReset')
  })

  socket.on('leaveRoom', () => leaveRoom(socket))
  socket.on('disconnect', () => leaveRoom(socket))
})

server.listen(port, () => {
  console.log(`Server is running on port ${port}`)
})
