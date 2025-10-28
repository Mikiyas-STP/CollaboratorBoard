// This module's single responsibility is to manage the WebSocket connection and events.

import {
  draw,
  drawRect,
  wrapTextAndDraw,
  renderAndDrawMath,
  ctx,
  canvas,
} from "./canvas.js";
import { setLatestActionTimestamp } from "./state.js";

// --- CONNECTION SETUP ---
let backendUrl;
if (
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1"
) {
  backendUrl = "http://localhost:3001";
} else {
  backendUrl =
    "https://collabrationboard-mikiyas-backend.hosting.codeyourfuture.io";
}
console.log(`Connecting to backend at: ${backendUrl}`);
export const socket = io(backendUrl);

// --- INCOMING EVENT HANDLERS ---
export function initializeSocket() {
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
      setLatestActionTimestamp(Date.now());
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  });
}

// --- HISTORY LOADER ---
export async function loadHistory() {
  try {
    const response = await fetch(`${backendUrl}/history`);
    const history = await response.json();
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
        await renderAndDrawMath(action.latex, action.x, action.y, true);
      }
    }
  } catch (error) {
    console.error("Failed to load drawing history:", error);
  }
}
