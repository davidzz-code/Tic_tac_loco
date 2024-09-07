import { Server } from 'socket.io'
import { createServer } from 'node:http'

const port = process.env.PORT ?? 3000

const server = createServer()

const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173',
  },
})

io.on('connection', (socket) => {

  socket.on('syncBoard', (data) => {
    console.log('Received syncBoard with data:', data.turn);
    socket.broadcast.emit('syncBoard', data)
  })
})

server.listen(port, () => {
  console.log(`Server is running on port ${port}`)
})