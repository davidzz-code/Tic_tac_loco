import { Server } from 'socket.io'
import { createServer } from 'node:http'

const port = process.env.PORT ?? 3000

const server = createServer()

const io = new Server(server, {
  cors: {
    origin: "*",
  },
  connectionStateRecovery: {
    
  }
})

io.on('connection', (socket) => {
  console.log('a user connected')

  socket.on('syncBoard', (data) => {
    io.emit('syncBoard', data)
  })
})

server.listen(port, () => {
  console.log(`Server is running on port ${port}`)
})




// import express from 'express';
// import logger from 'morgan';

// import { Server } from 'socket.io';
// import { createServer } from 'node:http';

// const port = process.env.PORT ?? 3000

// const app = express()
// const server = createServer(app)
// const io = new Server(server, {
//   cors: {
//     origin: "http://localhost:3000", // Cambia esto al origen de tu frontend
//     methods: ["GET", "POST"]
//   }
// });

// io.on('connection', (socket) => {
//   console.log('a user connected')
// })

// app.use(logger('dev'))

// app.get('/', (req, res) => { 
//   res.sendFile(process.cwd() + '/client/index.html')
// })

// server.listen(port, () => {
//   console.log(`Server is running on port ${port}`);
// })