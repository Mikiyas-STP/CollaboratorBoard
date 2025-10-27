let backendUrl;
if (
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1"
) {
  backendUrl = "http://localhost:3001";
} else {
  backendUrl = "https://collabrationboard-mikiyas-backend.hosting.codeyourfuture.io";
}
console.log(`Connecting to backend at: ${backendUrl}`);
const socket = io(backendUrl);

window.addEventListener("load", () => {
  const canvas = document.getElementById("canvas");
  const ctx = canvas.getContext("2d");
  const colorPicker = document.getElementById("colorPicker");
  const brushSize = document.getElementById("brushSize");
  const clearBtn = document.getElementById("clearBtn");
  const drawBtn = document.getElementById("drawBtn");
  const rectBtn = document.getElementById("rectBtn");
  const textBtn = document.getElementById("textBtn");
  const mathBtn = document.getElementById("mathBtn");
  const textInput = document.getElementById("textInput");

  canvas.width = window.innerWidth;
  canvas.height =
    window.innerHeight - document.querySelector(".toolbar").offsetHeight;

  //STATE MANAGEMENT
  let currentMode = "draw";
  let isDrawing = false;
  let lastX = 0;
  let lastY = 0;
  let latestActionTimestamp = 0;

  //REUSABLE DRAWING FUNCTIONS
  function wrapTextAndDraw(text, x, y, maxWidth, lineHeight, color, size) {
    ctx.fillStyle = color;
    ctx.font = `${size * 2}px sans-serif`;
    const words = text.split(" ");
    let line = "";
    let currentY = y;
    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + " ";
      const metrics = ctx.measureText(testLine);
      const testWidth = metrics.width;
      if (testWidth > maxWidth && n > 0) {
        ctx.fillText(line, x, currentY);
        line = words[n] + " ";
        currentY += lineHeight;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, x, currentY);
  }
//helper function to draw a math
  async function renderAndDrawMath(latex, x, y, isFromHistory = false) {
    const renderTimestamp = latestActionTimestamp;
    const tempDiv = document.createElement("div");
    tempDiv.style.visibility = "hidden";
    tempDiv.innerHTML = `\\(${latex}\\)`;
    document.body.appendChild(tempDiv);

    try {
      await MathJax.typesetPromise([tempDiv]);
      const svgElement = tempDiv.querySelector("svg");
      const errorElement = svgElement ? svgElement.querySelector("[data-mjx-error]") : null;

      if (svgElement && !errorElement) {
        svgElement.setAttribute("xmlns", "http://www.w3.org/2000/svg");
        const svgData = new XMLSerializer().serializeToString(svgElement);
        const dataUrl =
          "data:image/svg+xml;base64," +
          btoa(unescape(encodeURIComponent(svgData)));
        const img = new Image();
        img.onload = () => {
          if (renderTimestamp === latestActionTimestamp) {
            ctx.drawImage(img, x, y);
            if (!isFromHistory) {
              socket.emit("action", { type: "math", x: x, y: y, latex: latex, });
            }
          } else {
            console.log("Cancelled an outdated math render.");
          }
        };
        img.src = dataUrl;
      }
      else {
        if (!isFromHistory) {
          alert("Math rendering failed. Please check your LaTeX syntax.");
        }
      }
    }
    catch (err) {
      console.error("A critical error occurred in renderAndDrawMath:", err);
    }
    finally {
      document.body.removeChild(tempDiv);
    }
  }
//function to create text area
  function createInteractiveTextArea(x, y, width, height) {
    const textarea = document.createElement("textarea");
    textarea.style.position = "absolute";
    textarea.style.left = `${canvas.offsetLeft + x}px`;
    textarea.style.top = `${canvas.offsetTop + y}px`;
    textarea.style.width = `${width}px`;
    textarea.style.height = `${height}px`;
    textarea.style.border = "2px solid #007bff";
    textarea.style.outline = "none";
    textarea.style.font = "16px sans-serif";
    textarea.style.padding = "5px";
    textarea.style.resize = "none";
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.addEventListener("blur", () => {
      const text = textarea.value;
      const color = colorPicker.value;
      const size = brushSize.value;
      const lineHeight = size * 2 + 4;
      if (text) {
        const lineHeight = size * 2 + 4;
        wrapTextAndDraw( text, x + 5, y + size * 2, width - 10, lineHeight, color, size );
        socket.emit("action", { type: "textBox", x: x + 5, y: y + size * 2, maxWidth: width - 10, lineHeight: lineHeight, text: text, color: color, size: size, });
      }
      document.body.removeChild(textarea);
    });
  }
//function to draw a line
  function draw(x0, y0, x1, y1, color, size) {
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(x1, y1);
    ctx.strokeStyle = color;
    ctx.lineWidth = size;
    ctx.lineCap = "round";
    ctx.stroke();
  }
//function to draw a rectangle
  function drawRect(x, y, width, height, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, width, height);
  }
//REAL-TIME EVENT HANDLERS
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
    } else if (action.type === "textBox") {
      wrapTextAndDraw(
        action.text,
        action.x,
        action.y,
        action.maxWidth,
        action.lineHeight,
        action.color,
        action.size
      );
    } else if (action.type === "math") {
      renderAndDrawMath(action.latex, action.x, action.y, true);
    } else if (action.type === "clear") {
      latestActionTimestamp = Date.now();
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  });
//LOCAL MOUSE EVENT LISTENERS
  canvas.addEventListener("mousedown", (e) => {
    isDrawing = true;
    [lastX, lastY] = [e.offsetX, e.offsetY];
    if (currentMode === "math") {
      const latex = textInput.value;
      if (latex) {
        renderAndDrawMath(latex, e.offsetX, e.offsetY);
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
    } else if (isDrawing && currentMode === "text") {
      const width = e.offsetX - lastX;
      const height = e.offsetY - lastY;
      if (width > 10 || height > 10) {
        createInteractiveTextArea(lastX, lastY, width, height);
      }
    }
    isDrawing = false;
  });

  canvas.addEventListener("mouseout", () => {
    isDrawing = false;
  });

  async function loadHistory() {
    try {
      // Use the environment-aware URL
      const response = await fetch(`${backendUrl}/history`);
      const history = await response.json();
      console.log("History received:", history);
      for (const action of history) {
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
        } else if (action.type === "textBox") {
          wrapTextAndDraw(
            action.text,
            action.x,
            action.y,
            action.maxWidth,
            action.lineHeight,
            action.color,
            action.size
          );
        } else if (action.type === "math") {
          await renderAndDrawMath(action.latex, action.x, action.y, true);
        }
      }
    } catch (error) {
      console.error("Failed to load drawing history:", error);
    }
  }
  loadHistory();

//TOOLBAR LOGIC
  clearBtn.addEventListener("click", () => {
    latestActionTimestamp = Date.now();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    socket.emit("action", { type: "clear" });
  });

  function setActiveTool(toolButton) {
    document.querySelectorAll(".tool").forEach((btn) => {
      btn.classList.remove("active");
    });
    toolButton.classList.add("active");
  }

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

  mathBtn.addEventListener("click", () => {
    currentMode = "math";
    textInput.placeholder = "Enter LaTeX math here...";
    setActiveTool(mathBtn);
  });

  setActiveTool(drawBtn);
});
