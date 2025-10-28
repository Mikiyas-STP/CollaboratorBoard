// This module's single responsibility is to handle user interactions with the toolbar.

import { setCurrentMode, setLatestActionTimestamp } from "./state.js";
import { canvas, ctx } from "./canvas.js";
import { socket } from "./socket.js";

export function initializeUI() {
  // Get all the toolbar elements
  const colorPicker = document.getElementById("colorPicker");
  const brushSize = document.getElementById("brushSize");
  const clearBtn = document.getElementById("clearBtn");
  const drawBtn = document.getElementById("drawBtn");
  const rectBtn = document.getElementById("rectBtn");
  const textBtn = document.getElementById("textBtn");
  const mathBtn = document.getElementById("mathBtn");
  const textInput = document.getElementById("textInput");

  // This helper function lives here because it only affects the UI
  function setActiveTool(toolButton) {
    document.querySelectorAll(".tool").forEach((btn) => {
      btn.classList.remove("active");
    });
    toolButton.classList.add("active");
  }

  // --- EVENT LISTENERS FOR THE TOOLBAR ---
  clearBtn.addEventListener("click", () => {
    setLatestActionTimestamp(Date.now());
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    socket.emit("action", { type: "clear" });
  });

  drawBtn.addEventListener("click", () => {
    setCurrentMode("draw");
    setActiveTool(drawBtn);
    textInput.placeholder = "";
  });

  rectBtn.addEventListener("click", () => {
    setCurrentMode("rectangle");
    setActiveTool(rectBtn);
  });

  textBtn.addEventListener("click", () => {
    setCurrentMode("text");
    setActiveTool(textBtn);
    textInput.placeholder = "Draw a box to start typing...";
  });

  mathBtn.addEventListener("click", () => {
    setCurrentMode("math");
    setActiveTool(mathBtn);
    textInput.placeholder = "Enter LaTeX math here...";
  });

  // Set the initial state on page load
  setActiveTool(drawBtn);
}
