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
app.post('/process-board', async (req, res) => {
  const newBoard = JSON.stringify(req.body.newBoard)
  const chatBoard = await getChatResponse(newBoard)

  console.log('Antes de chat gpt:', newBoard)

  console.log('Después de chat gpt:', chatBoard)

  res.json({ chatBoard })
})

const client = new OpenAI(process.env.PAID_KEY)

async function getChatResponse(newBoard) {
  const response = await client.chat.completions.create({
    model: "gpt-4-turbo",
    messages: [
      { 
        role: "system", 
        content: `You are an AI that plays an advanced version of tic-tac-toe, where each square contains another tic-tac-toe. The board is a 9-element array, each element being a 9-position array for smaller games. The rules are as follows:
        1. You always play as '○', and your opponent plays as '✕'.
        2. Players take turns in the smaller tic-tac-toes within the main board.
        3. Winning a smaller game turns that subarray into a '✕' or '○', depending on who won.
        4. A move in a smaller tic-tac-toe dictates where the next player must play. You must play in the subarray that corresponds to the position of the last move made by your opponent.
        5. If a subarray is already won or full, you can choose any other available subarray.
        6. The game is won by getting three in a row on the main board with '✕' or '○'.
        
        You are '○' and the opponent is '✕'. Based on the current board, select your move following the rules. Return only the index of the sub-board where you will play (from 0 to 8), and the index within that sub-board where you will place your symbol (from 0 to 8). Return these as an array in the format [sub-board index, sub-board position]. No explanations.`
        
      },
      { role: "user", content: newBoard }
    ]
  })

  return JSON.parse(response.choices[0].message.content)
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