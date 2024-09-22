import { Server } from 'socket.io'
import { createServer } from 'node:http'
import { parse } from 'node:url'
import dotenv from 'dotenv'
import express from 'express'
import cors from 'cors'

dotenv.config()
const port = process.env.PORT ?? 3000

const app = express()
app.use(express.json())

// Configurar CORS
app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST'],
}))

// Ruta principal
app.get('/', (req, res) => {
  res.send('Hello World!')
})

// Nueva ruta para procesar el tablero
app.post('/process-board', (req, res) => {
  const newBoard = req.body.newBoard
  console.log('Tablero recibido:', newBoard)

  // Aquí puedes agregar la lógica que quieras para procesar el tablero
  const updatedBoard = [...newBoard]
  updatedBoard[0] = 'X'
  // getChatResponse(updatedBoard)

  res.json({ updatedBoard }) // Devuelves el tablero actualizado al cliente
})


// Crear servidor HTTP y asociarlo a express
const server = createServer(app)

// Configurar socket.io
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST'],
  },
})

io.on('connection', (socket) => {
  socket.on('syncBoard', (data) => {
    console.log('Received syncBoard with data:', data.turn)
    socket.broadcast.emit('syncBoard', data)
  })
})

// Iniciar el servidor
server.listen(port, () => {
  console.log(`Server is running on port ${port}`)
})