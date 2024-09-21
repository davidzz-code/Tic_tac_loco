import { Server } from 'socket.io'
import { createServer } from 'node:http'
import { parse } from 'node:url'
import dotenv from 'dotenv'
import OpenAI from "openai"

dotenv.config()
const port = process.env.PORT ?? 3000
const client = new OpenAI(process.env.OPENAI_API_KEY)

const server = createServer((req, res) => {
  const url = parse(req.url, true)
  if (url.pathname === '/') {
    res.writeHead(200, { 'Content-Type': 'text/plain' })
    res.end('Hello World!')
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' })
    res.end('Not Found')
  }
})

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

server.listen(port, () => {
  console.log(`Server is running on port ${port}`)
})
