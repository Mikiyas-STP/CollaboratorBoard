window.addEventListener("load", () => {
  // Get references to our HTML elements
  const canvas = document.getElementById("canvas");
  const colorPicker = document.getElementById("colorPicker");
  const brushSize = document.getElementById("brushSize");
  const clearBtn = document.getElementById("clearBtn");
  const drawBtn = document.getElementById("drawBtn");
  const rectBtn = document.getElementById("rectBtn");
  const textBtn = document.getElementById("textBtn");
  const ctx = canvas.getContext("2d"); //the 2D drawing toolbox

  canvas.width = window.innerWidth; //set canvas dimensions to fill the window
  canvas.height =
    window.innerHeight - document.querySelector(".toolbar").offsetHeight;

  //STATE MANAGEMENT
  let currentMode = "draw"; // Possible modes: 'draw', 'rectangle', 'text'
  // This variable will remember if the mouse button is pressed down
  let isDrawing = false;
  let lastX = 0;
  let lastY = 0;

  //CORE DRAWING LOGIC
  // This function is called every time the mouse moves
  function draw(e) {
    if (!isDrawing) return; //isDrawing is false -> don't do anything
    // Get the current mouse coordinates relative to the canvas
    const currentX = e.offsetX;
    const currentY = e.offsetY;

    // Use the context to draw a line segment
    ctx.beginPath(); // Start a new path
    ctx.moveTo(lastX, lastY); // Move the "pen" to the last position
    ctx.lineTo(currentX, currentY); // Draw a line to the new position
    ctx.stroke(); // Render the line with the current color/width

    // Update the last position to the current one for the next segment
    [lastX, lastY] = [currentX, currentY];
  }

  //EVENT LISTENERS
  //When the mouse button is pressed down
  canvas.addEventListener("mousedown", (e) => {
    isDrawing = true;
    // Update our starting position
    [lastX, lastY] = [e.offsetX, e.offsetY];
  });

  // When the mouse moves
  canvas.addEventListener("mousemove", draw);

  // When the mouse button is released
  canvas.addEventListener("mouseup", () => (isDrawing = false));

  // Also stop drawing if the mouse cursor leaves the canvas area
  canvas.addEventListener("mouseout", () => (isDrawing = false));

  // --- NEW CODE FOR TICKET 3 STARTS HERE ---

  // Event listener for the color picker
  colorPicker.addEventListener("change", (e) => {
    // When the color changes, update the strokeStyle on the canvas context
    ctx.strokeStyle = e.target.value;
  });

  // Event listener for the brush size slider
  brushSize.addEventListener("change", (e) => {
    // When the size changes, update the lineWidth on the canvas context
    ctx.lineWidth = e.target.value;
  });

  // Event listener for the "Clear All" button
  clearBtn.addEventListener("click", () => {
    // clearRect() clears a specified rectangular area.
    // We give it the entire canvas dimensions to wipe it clean.
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  });

  // --- NEW CODE FOR TICKET 4 STARTS HERE ---

  // A helper function to manage the "active" state of tool buttons
  function setActiveTool(toolButton) {
    // First, remove the .active class from all tool buttons
    document.querySelectorAll(".tool").forEach((btn) => {
      btn.classList.remove("active");
    });
    // Then, add the .active class to the clicked button
    toolButton.classList.add("active");
  }

  // Event Listeners for Tool Buttons
  drawBtn.addEventListener("click", () => {
    currentMode = "draw";
    setActiveTool(drawBtn);
    console.log("Current Mode:", currentMode); // For debugging
  });

  rectBtn.addEventListener("click", () => {
    currentMode = "rectangle";
    setActiveTool(rectBtn);
    console.log("Current Mode:", currentMode); // For debugging
  });

  textBtn.addEventListener("click", () => {
    currentMode = "text";
    setActiveTool(textBtn);
    console.log("Current Mode:", currentMode); // For debugging
  });

  // Set the initial active tool on page load
  setActiveTool(drawBtn);

});
