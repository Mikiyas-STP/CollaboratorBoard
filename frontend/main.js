// This is the main entry point for the application. Its job is to initialize all the modules.

import { initializeCanvasEvents } from "./modules/canvas.js";
import { initializeUI } from "./modules/ui.js";
import { initializeSocket, loadHistory } from "./modules/socket.js";

window.addEventListener("load", () => {
  console.log("Application starting up...");

  // Initialize all the separate parts of the application
  initializeUI();
  initializeSocket();
  initializeCanvasEvents();

  // Load the history after everything is set up
  loadHistory();
});
