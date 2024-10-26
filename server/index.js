import { Server } from 'socket.io'
import { createServer } from 'node:http'
import dotenv from 'dotenv'
import express from 'express'
import OpenAI from 'openai'
import cors from 'cors'
import { validateAiMove, getWonSubboards } from './aiMoveValidation'

dotenv.config()
const port = process.env.PORT ?? 3000

const app = express()
app.use(express.json())

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST'],
}))


// Ruta principal
app.get('/', (req, res) => {
  res.send('The server works!')
})


// Nueva ruta para procesar el tablero
app.post('/process-board', async (req, res) => {
  const newBoardString = JSON.stringify(req.body.newBoard)
  const newBoard = JSON.parse(newBoardString)
  const userBoardIndex = req.body.userBoardIndex
  const userSquareIndex = req.body.userSquareIndex

  const chatBoard = await getChatResponse(newBoardString, userBoardIndex, userSquareIndex)
  
  // Valida la respuesta de la IA
  const validatedMove = validateAiMove(newBoard, chatBoard, userSquareIndex)

  if (validatedMove !== null) {
    return res.json({ chatBoard: validatedMove })
  }

  return res.status(400).json({ error: 'No valid moves available' })
})

const client = new OpenAI(process.env.OPENAI_API_KEY)

async function getChatResponse(newBoard, userBoardIndex, userSquareIndex) {
  const response = await client.chat.completions.create({
    model: "gpt-4-turbo",
    messages: [
      { 
        role: "system", 
        content: `You are an AI that plays an advanced version of tic-tac-toe. Each square contains another tic-tac-toe game. You are '○', and your opponent is '✕'.
        1. Players take turns.
        2. A move dictates where the next player must play.
        3. If a subarray is full or won, choose any available subarray.
        4. Return only the indices of your move as [sub-board index, sub-board position]. No explanation`
      },
      { role: "user", content: `The current state of the board is: ${JSON.stringify(newBoard)}. 
        The last move was made at position (${userBoardIndex}, ${userSquareIndex}) of the corresponding sub-position. 
        The following sub-boards have been won: ${getWonSubboards(JSON.parse(newBoard))}. 
        You cannot play in the won sub-boards. 
        Please choose your move in one of these available sub-boards.`
      }
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