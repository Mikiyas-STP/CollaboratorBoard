const { addToActionHistory, clearHistory } = require("./state/history");

/**
 * Initializes all Socket.io event listeners.
 * @param {object} io - The main Socket.io server instance from server.js.
 */
function initializeSocket(io) {
  io.on("connection", (socket) => {
    console.log(`Client connected: ${socket.id}`);
    socket.on("action", (action) => {
      socket.broadcast.emit("action", action);
      if (action.type === "clear") {
        clearHistory();
        console.log("History cleared by client:", socket.id);
      } else {
        addToActionHistory(action);
      }
    });
    socket.on("disconnect", () => {
      console.log(`Client disconnected: ${socket.id}`);
    });
  });
}
module.exports = { initializeSocket };
