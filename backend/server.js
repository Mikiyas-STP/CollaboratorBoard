const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] },
});
const PORT = process.env.PORT || 3001;
app.use(cors());
// This array stores our "logbook" of all actions taken
let actionHistory = [];
// HTTP endpoint for new clients to get the full history
app.get("/history", (req, res) => {
  res.json(actionHistory);
});
// This is the main "control room" logic for real-time events
io.on("connection", (socket) => {
  console.log(`Client connected: ${socket.id}`);
  // Listen for an 'action' event from any client
  socket.on("action", (action) => {
    // When an action is received:
    // 1. Add it to our history.
    actionHistory.push(action);
    // 2. Broadcast it to all OTHER clients.
    socket.broadcast.emit("action", action);
  });

  socket.on("disconnect", () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
