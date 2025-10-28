// This module's single responsibility is to hold the application's shared state.

export let currentMode = "draw";
export let isDrawing = false;
export let lastX = 0;
export let lastY = 0;
export let latestActionTimestamp = 0;

// "Setter" functions allow other modules to safely change the state.
export function setCurrentMode(mode) {
  currentMode = mode;
}
export function setIsDrawing(value) {
  isDrawing = value;
}
export function setLastCoords(x, y) {
  lastX = x;
  lastY = y;
}
export function setLatestActionTimestamp(timestamp) {
  latestActionTimestamp = timestamp;
}
