// This line should be at the very top, outside the load event listener
const socket = io("http://localhost:3001");

window.addEventListener("load", () => {
  // --- 1. SETUP ---
  const canvas = document.getElementById("canvas");
  const ctx = canvas.getContext("2d");
  const colorPicker = document.getElementById("colorPicker");
  const brushSize = document.getElementById("brushSize");
  const clearBtn = document.getElementById("clearBtn");
  const drawBtn = document.getElementById("drawBtn");
  const rectBtn = document.getElementById("rectBtn");
  const textBtn = document.getElementById("textBtn");
  const textInput = document.getElementById("textInput");

  canvas.width = window.innerWidth;
  canvas.height =
    window.innerHeight - document.querySelector(".toolbar").offsetHeight;

  // --- 2. STATE MANAGEMENT ---
  let currentMode = "draw";
  let isDrawing = false;
  let lastX = 0;
  let lastY = 0;

  // --- 3. REUSABLE DRAWING FUNCTIONS ---
  function draw(x0, y0, x1, y1, color, size) {
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(x1, y1);
    ctx.strokeStyle = color;
    ctx.lineWidth = size;
    ctx.lineCap = "round";
    ctx.stroke();
  }

  function drawRect(x, y, width, height, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, width, height);
  }

  function drawText(x, y, text, color, size) {
    ctx.fillStyle = color;
    ctx.font = `${size * 2}px sans-serif`;
    ctx.fillText(text, x, y);
  }

  // --- 4. REAL-TIME EVENT HANDLERS ---

  // This listener handles incoming actions from OTHER users
  socket.on("action", (action) => {
    if (action.type === "draw") {
      draw(
        action.x0,
        action.y0,
        action.x1,
        action.y1,
        action.color,
        action.size
      );
    } else if (action.type === "rect") {
      drawRect(action.x, action.y, action.width, action.height, action.color);
    } else if (action.type === "text") {
      drawText(action.x, action.y, action.text, action.color, action.size);
    } else if (action.type === "clear") {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  });

  // --- 5. LOCAL MOUSE EVENT LISTENERS (for the current user's actions) ---

  canvas.addEventListener("mousedown", (e) => {
    isDrawing = true;
    [lastX, lastY] = [e.offsetX, e.offsetY];

    if (currentMode === "text") {
      const text = textInput.value;
      if (text) {
        const color = colorPicker.value;
        const size = brushSize.value;
        drawText(e.offsetX, e.offsetY, text, color, size);
        socket.emit("action", {
          type: "text",
          x: e.offsetX,
          y: e.offsetY,
          text,
          color,
          size,
        });
      }
    }
  });

  canvas.addEventListener("mousemove", (e) => {
    if (isDrawing && currentMode === "draw") {
      const color = colorPicker.value;
      const size = brushSize.value;
      const [currentX, currentY] = [e.offsetX, e.offsetY];
      draw(lastX, lastY, currentX, currentY, color, size);
      socket.emit("action", {
        type: "draw",
        x0: lastX,
        y0: lastY,
        x1: currentX,
        y1: currentY,
        color,
        size,
      });
      [lastX, lastY] = [currentX, currentY];
    }
  });

  canvas.addEventListener("mouseup", (e) => {
    if (isDrawing && currentMode === "rectangle") {
      const color = colorPicker.value;
      const width = e.offsetX - lastX;
      const height = e.offsetY - lastY;
      drawRect(lastX, lastY, width, height, color);
      socket.emit("action", {
        type: "rect",
        x: lastX,
        y: lastY,
        width,
        height,
        color,
      });
    }
    isDrawing = false;
  });

  canvas.addEventListener("mouseout", () => {
    isDrawing = false;
  });


  
  // This function will fetch the history and draw it on the canvas
  async function loadHistory() {
    try {
      // Use fetch to make a GET request to our server's /history endpoint
      const response = await fetch("http://localhost:3001/history");
      const history = await response.json();

      console.log("History received:", history); // For debugging

      // Loop through each action in the history
      history.forEach((action) => {
        // Use the same logic as our socket.on listener to draw each action
        if (action.type === "draw") {
          draw(
            action.x0,
            action.y0,
            action.x1,
            action.y1,
            action.color,
            action.size
          );
        } else if (action.type === "rect") {
          drawRect(
            action.x,
            action.y,
            action.width,
            action.height,
            action.color
          );
        } else if (action.type === "text") {
          drawText(action.x, action.y, action.text, action.color, action.size);
        } else if (action.type === "clear") {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
      });
    } catch (error) {
      console.error("Failed to load drawing history:", error);
    }
  }

  // Call the function once when the script loads to get the history
  loadHistory();

  // --- 6. TOOLBAR LOGIC (This is the part I missed) ---

  // Event listener for the color picker
  colorPicker.addEventListener("change", (e) => {
    // No change needed here, the values are read when an action happens
  });

  // Event listener for the brush size slider
  brushSize.addEventListener("change", (e) => {
    // No change needed here, the values are read when an action happens
  });

  // Event listener for the "Clear All" button
  clearBtn.addEventListener("click", () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    socket.emit("action", { type: "clear" });
  });

  // Helper function to manage the "active" state of tool buttons
  function setActiveTool(toolButton) {
    document.querySelectorAll(".tool").forEach((btn) => {
      btn.classList.remove("active");
    });
    toolButton.classList.add("active");
  }

  // Event Listeners for Tool Buttons
  drawBtn.addEventListener("click", () => {
    currentMode = "draw";
    setActiveTool(drawBtn);
  });

  rectBtn.addEventListener("click", () => {
    currentMode = "rectangle";
    setActiveTool(rectBtn);
  });

  textBtn.addEventListener("click", () => {
    currentMode = "text";
    setActiveTool(textBtn);
  });

  // Set the initial active tool on page load
  setActiveTool(drawBtn);
});
