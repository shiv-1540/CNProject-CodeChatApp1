const express = require('express');
const http = require('http');
const bodyparser = require('body-parser');
const path = require('path');
const cors = require('cors');
require('dotenv').config();
const port = process.env.PORT || 3000;

const userAuthen = require('./routes/AuthenRoutes');
const projectRoom = require('./routes/ProjectRoomRoute');
const database = require('./database/databaseSetup');

const app = express();
const server = http.createServer(app);
const {Server} = require('socket.io');
const io = new Server(server, {
    cors: {
      origin: "http://localhost:5173",
      methods: ["GET", "POST"],
    },
  });

// socketio setup:
// use to track which user got which socket id, so that each has different socket id 
const userSocketMap = {};

const getAllConnectedClients = (roomId) => {
    return Array.from(io.sockets.adapter.rooms.get(roomId) || []).map((socketId) => {
        return {
            socketId,
            username: userSocketMap[socketId],
        }
    }); // map type
}

// socket connection - server side
// same hume client side banana h
io.on("connection", (socket) => {
    console.log("New client connected", socket.id);
  
    // Handle room joining
    socket.on("join", ({ roomId, username }) => {
      socket.join(roomId);
      userSocketMap[socket.id] = username;
  
      const clients = getAllConnectedClients(roomId);
      clients.forEach(({ socketId }) => {
        io.to(socketId).emit("joined", { clients, username, socketId: socket.id });
      });
    });
  
    // Handle code-change event
    socket.on("code-change", ({ roomId, code }) => {
      socket.to(roomId).emit("code-change", { roomId, code });
    });
  
    // Handle disconnect
    socket.on("disconnecting", () => {
      const rooms = [...socket.rooms];
      rooms.forEach((roomId) => {
        socket.in(roomId).emit("disconnected", {
          socketId: socket.id,
          username: userSocketMap[socket.id]
        });
      });
      delete userSocketMap[socket.id];
    });
  });
  


  
//   // Socket.io connection setup
//   io.on("connection", (socket) => {
//     console.log("New client connected", socket.id);
  
//     // Handle room joining
//     socket.on("join", ({ roomId, username }) => {
//       socket.join(roomId);
//       io.to(roomId).emit("joined", { username, socketId: socket.id });
//       console.log(`${username} joined room ${roomId}`);
//     });
  
//     // Handle code-change event
//     socket.on("code-change", ({ roomId, code }) => {
//       socket.broadcast.to(roomId).emit("code-change", { code });
//     });
  
//     // Handle disconnect
//     socket.on("disconnect", () => {
//       console.log("Client disconnected", socket.id);
//     });
//   });
  

















// Middlewares
app.use(cors());
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/userAuthen', userAuthen);
app.use('/projectRoom', projectRoom);

// Error handling middleware (optional)
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

// Start server
server.listen(port, () => {
    console.log('Server is running on port 3000');
});
