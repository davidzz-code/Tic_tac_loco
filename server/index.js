import { Server } from 'socket.io'
import { createServer } from 'node:http'
import dotenv from 'dotenv'
import express from 'express'
import OpenAI from 'openai'
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
  const chatBoard = getChatResponse(newBoard)

  res.json({ chatBoard })
})

const client = new OpenAI(process.env.OPENAI_API_KEY)

async function getChatResponse(newBoard) {
  const response = await client.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      { 
        role: "system", 
        content: "You are an AI that plays an advanced version of tic-tac-toe, where each square contains another tic-tac-toe. The board is a 9-element array, each being a 9-position array for smaller games. Rules: 1. Players play in smaller tic-tac-toes. 2. Winning a smaller game turns that subarray into '✕' or '○'. 3. A move in a smaller tic-tac-toe dictates where the next player must play. 4. The game is won by getting three in a row on the main board with '✕' or '○'. Play strategically, and return only the updated board as an array, with no explanations. Each element should reflect the current state (arrays for smaller games or '✕'/'○' for won ones)." 
      },
      { role: "user", content: newBoard }
    ]
  })

  console.log('Chat response:', response.choices[0].message.content)
  return response.choices[0].message.content
}


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