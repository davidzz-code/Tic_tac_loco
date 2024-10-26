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
  origin: 'https://tic-tac-loco.vercel.app', // Solo permite solicitudes de este origen
  methods: ['GET', 'POST'],
}))

function getWonSubboards(board) {
  const wonBoards = [];
  board.forEach((subBoard, index) => {
    if (typeof subBoard === 'string') {
      wonBoards.push(index); // Agrega el índice del subtablero ganado
    }
  });
  return wonBoards.length > 0 ? wonBoards.join(', ') : 'none';
}

function findFirstValidPosition(board, subBoardIndex) {
  const subBoard = board[subBoardIndex];
  
  for (let i = 0; i < subBoard.length; i++) {
    if (subBoard[i] === null) { // Asumiendo que las posiciones ocupadas son no nulas
      return i; // Devuelve la primera posición válida
    }
  }
  
  return null; // Si no hay posiciones válidas
}

function validateAiMove(newBoard, chatBoard, userSquareIndex) {
  const [subBoardIndex, positionIndex] = chatBoard;

  // Verifica si el sub-tablero correspondiente está ganado
  if (newBoard[userSquareIndex].length > 0 && typeof newBoard[userSquareIndex] === 'string') {
    console.warn(`El sub-tablero ${userSquareIndex} ya está ganado.`);
    // Busca la primera posición libre en cualquier sub-tablero disponible
    const validPosition = findFirstValidPosition(newBoard, subBoardIndex);
    
    if (validPosition !== null) {
      console.log(`Eligiendo posición válida: ${validPosition} en el sub-tablero ${subBoardIndex}`);
      return [subBoardIndex, validPosition]; // Retorna el sub-tablero y la primera posición válida
    } else {
      console.error('No hay posiciones válidas disponibles en el sub-tablero');
      return null; // Indica que no hay movimientos disponibles
    }
  }

  // Verifica si el índice del sub-tablero es correcto
  if (userSquareIndex !== subBoardIndex) {
    console.warn(`El índice del sub-tablero es incorrecto. Esperado: ${userSquareIndex}, recibido: ${subBoardIndex}`);
    
    // Busca la primera posición libre en el sub-tablero correcto
    const validPosition = findFirstValidPosition(newBoard, userSquareIndex);
    
    if (validPosition !== null) {
      console.log(`Eligiendo posición válida: ${validPosition} en el sub-tablero ${userSquareIndex}`);
      return [userSquareIndex, validPosition]; // Retorna el sub-tablero correcto y la primera posición válida
    } else {
      console.error('No hay posiciones válidas disponibles en el sub-tablero');
      return null; // Indica que no hay movimientos disponibles
    }
  }
  
  // Verifica si la posición elegida por la IA está ocupada
  if (newBoard[subBoardIndex][positionIndex] !== null) {
    console.warn(`La posición ${positionIndex} en el sub-tablero ${subBoardIndex} está ocupada.`);
    
    // Busca la primera posición libre en el sub-tablero correspondiente
    const validPosition = findFirstValidPosition(newBoard, subBoardIndex);
    
    if (validPosition !== null) {
      console.log(`Eligiendo posición válida: ${validPosition} en el sub-tablero ${subBoardIndex}`);
      return [subBoardIndex, validPosition]; // Retorna el sub-tablero y la primera posición válida
    } else {
      console.error('No hay posiciones válidas disponibles en el sub-tablero');
      return null; // Indica que no hay movimientos disponibles
    }
  }
  
  // Si todo está bien, retorna la jugada original de la IA
  return chatBoard;
}

// Ruta principal
app.get('/', (req, res) => {
  res.send('Hello World!')
})


// Nueva ruta para procesar el tablero
app.post('/process-board', async (req, res) => {
  const newBoardString = JSON.stringify(req.body.newBoard);
  const newBoard = JSON.parse(newBoardString);
  const userBoardIndex = req.body.userBoardIndex;
  const userSquareIndex = req.body.userSquareIndex;

  const chatBoard = await getChatResponse(newBoardString, userBoardIndex, userSquareIndex);
  
  // Valida la respuesta de la IA
  const validatedMove = validateAiMove(newBoard, chatBoard, userSquareIndex);

  if (validatedMove !== null) {
    return res.json({ chatBoard: validatedMove });
  }

  return res.status(400).json({ error: 'No valid moves available' });
});

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

  console.log('Respuesta de la IA:', response.choices[0].message.content); // Imprimir para depurar
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