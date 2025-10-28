const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const { initializeSocket } = require("./socketHandler");
const historyRoutes = require("./routes/history");
const logger = require("./middleware/logger");
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] },
});
const PORT = process.env.PORT || 3001;
app.use(cors());
app.use(logger);
app.use("/history", historyRoutes);
initializeSocket(io);
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
module.exports = { server };