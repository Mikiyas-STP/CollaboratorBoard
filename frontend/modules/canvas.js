import {
  currentMode,
  isDrawing,
  lastX,
  lastY,
  latestActionTimestamp,
  setIsDrawing,
  setLastCoords,
} from "./state.js";
import { socket } from "./socket.js";
export const canvas = document.getElementById("canvas");
export const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height =
  window.innerHeight - document.querySelector(".toolbar").offsetHeight;

export function draw(x0, y0, x1, y1, color, size) {
  ctx.beginPath();
  ctx.moveTo(x0, y0);
  ctx.lineTo(x1, y1);
  ctx.strokeStyle = color;
  ctx.lineWidth = size;
  ctx.lineCap = "round";
  ctx.stroke();
}

export function drawRect(x, y, width, height, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, width, height);
}

export function wrapTextAndDraw(text, x, y, maxWidth, lineHeight, color, size) {
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

export async function renderAndDrawMath(latex, x, y, isFromHistory = false) {
  const renderTimestamp = latestActionTimestamp;
  const tempDiv = document.createElement("div");
  tempDiv.style.visibility = "hidden";
  tempDiv.innerHTML = `\\(${latex}\\)`;
  document.body.appendChild(tempDiv);
  try {
    await MathJax.typesetPromise([tempDiv]);
    const svgElement = tempDiv.querySelector("svg");
    const errorElement = svgElement
      ? svgElement.querySelector("[data-mjx-error]")
      : null;
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
            socket.emit("action", { type: "math", x: x, y: y, latex: latex });
          }
        } else {
          console.log("Cancelled an outdated math render.");
        }
      };
      img.src = dataUrl;
    } else {
      if (!isFromHistory) {
        alert("Math rendering failed. Please check your LaTeX syntax.");
      }
    }
  } catch (err) {
    console.error("A critical error occurred in renderAndDrawMath:", err);
  } finally {
    document.body.removeChild(tempDiv);
  }
}

// --- HELPER FUNCTIONS (Only used within this file) ---
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
    const colorPicker = document.getElementById("colorPicker");
    const brushSize = document.getElementById("brushSize");
    const color = colorPicker.value;
    const size = brushSize.value;
    const lineHeight = size * 2 + 4;
    if (text) {
      wrapTextAndDraw(
        text,
        x + 5,
        y + size * 2,
        width - 10,
        lineHeight,
        color,
        size
      );
      socket.emit("action", {
        type: "textBox",
        x: x + 5,
        y: y + size * 2,
        maxWidth: width - 10,
        lineHeight: lineHeight,
        text: text,
        color: color,
        size: size,
      });
    }
    document.body.removeChild(textarea);
  });
}

// --- CANVAS EVENT LISTENERS ---
export function initializeCanvasEvents() {
  canvas.addEventListener("mousedown", (e) => {
    setIsDrawing(true);
    setLastCoords(e.offsetX, e.offsetY);
    if (currentMode === "math") {
      const textInput = document.getElementById("textInput");
      const latex = textInput.value;
      if (latex) {
        renderAndDrawMath(latex, e.offsetX, e.offsetY);
      }
    }
  });

  canvas.addEventListener("mousemove", (e) => {
    if (isDrawing && currentMode === "draw") {
      const colorPicker = document.getElementById("colorPicker");
      const brushSize = document.getElementById("brushSize");
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
      setLastCoords(currentX, currentY);
    }
  });

  canvas.addEventListener("mouseup", (e) => {
    if (isDrawing && currentMode === "rectangle") {
      const colorPicker = document.getElementById("colorPicker");
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
      if (Math.abs(width) > 10 || Math.abs(height) > 10) {
        createInteractiveTextArea(lastX, lastY, width, height);
      }
    }
    setIsDrawing(false);
  });

  canvas.addEventListener("mouseout", () => {
    setIsDrawing(false);
  });
}
