// --- This is the complete and correct code for backend/server.js ---

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

// This is the server's "master record" of the drawing.
let actionHistory = [];

// This endpoint serves the master record to new users.
app.get("/history", (req, res) => {
  res.json(actionHistory);
});

// This is the real-time logic block.
io.on("connection", (socket) => {
  console.log(`Client connected: ${socket.id}`);

  // This is the listener for incoming actions.
  socket.on("action", (action) => {
    // Step 1: Tell all other clients what just happened.
    socket.broadcast.emit("action", action);

    // Step 2: Update the master record.
    if (action.type === "clear") {
      actionHistory = []; // The fix for the clear bug.
      console.log("History cleared by client:", socket.id);
    } else {
      actionHistory.push(action);
    }
  });

  socket.on("disconnect", () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

// Start the server.
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
