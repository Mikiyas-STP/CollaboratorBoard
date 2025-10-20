# CollaboraCanvas: A Real-Time, Multi-Tool Collaborative Whiteboard

**CollaboraCanvas** is a full-stack web application that provides a shared digital whiteboard for users to draw, write, and solve math problems together in real-time. This project was built from the ground up using Vanilla JavaScript, Node.js, and WebSockets to demonstrate the power of real-time communication on the web.

**Live Demo:** `[https://collabrationboard@mikiyas-stp.hosting.codeyourfuture.io/]`

---

### Screenshot

<img src="./Screenshot 2025-10-20 at 20.37.12-1.png" alt="Description of screenshot" width="600"/>


---

### Features

*   **Real-Time Collaboration:** All actions are instantly broadcast to all connected users.
*   **Multi-Tool Palette:** Users can switch between several tools:
    *   **Freehand Drawing:** Draw smooth lines with adjustable color and brush size.
    *   **Rectangle Tool:** Create colored shapes.
    *   **Interactive Text Box:** Draw a box to create a rich text area directly on the canvas with automatic word wrapping.
    *   **Math Formula Rendering:** Write mathematical formulas using LaTeX syntax and render them as high-quality images on the canvas via MathJax.
*   **Persistent History:** New users who join a session instantly see the complete drawing history.
*   **Robust & Performant:** Built with advanced bug-fixing to handle asynchronous race conditions and prevent real-time feedback loops.

---

### Technology Stack

#### **Frontend**
*   **HTML5 & CSS3:** For structure and styling.
*   **Vanilla JavaScript (ES6+):** For all client-side logic, state management, and DOM manipulation.
*   **HTML Canvas API:** The core rendering engine for all drawing, shapes, and images.
*   **Socket.io-client:** Manages the real-time WebSocket connection to the server.
*   **MathJax:** A powerful third-party library for rendering LaTeX mathematical formulas.

#### **Backend**
*   **Node.js:** The JavaScript runtime environment for the server.
*   **Express.js:** A minimalist web framework for handling the HTTP history endpoint.
*   **Socket.io:** The core of the backend, managing WebSocket connections, receiving events, and broadcasting actions to all clients.

---

### Key Technical Concepts & Challenges

This project was a deep dive into the architecture of real-time web applications. Key challenges and concepts include:

1.  **Two-Channel Communication Model:** The application uses a robust pattern where new clients fetch the entire drawing history via a one-time **HTTP `GET` request**, and then receive all subsequent updates via a persistent **WebSocket connection**.
2.  **The Render-to-Image Pipeline:** The math feature was implemented by creating a complex data pipeline: **LaTeX String → MathJax → SVG Element → Data URL → `<img>` Element → Canvas `drawImage()`**.
3.  **Advanced Bug Fixing:**
    *   **Race Condition:** Solved a bug where a slow math rendering operation could finish *after* the canvas was cleared. This was fixed by implementing a timestamping system to cancel outdated asynchronous operations.
    *   **History Echo Loop:** Solved a bug where clients loading the history would re-broadcast every action. This was fixed by adding an `isFromHistory` flag to drawing functions to make them "silent" when necessary.

---

### How to Run Locally

1.  Clone the repository: `git clone [YOUR GITHUB REPO URL]`
2.  Navigate to the backend: `cd CollaboraCanvas/backend`
3.  Install dependencies: `npm install`
4.  Start the server: `node server.js` (The server will run on `http://localhost:3001`)
5.  In a new terminal, navigate to the frontend: `cd ../frontend`
6.  Serve the frontend files. The easiest way is with the `serve` package: `npx serve`
7.  Open the local URL provided by `serve` in your browser.

---

### Author

`[Mikiyas Gebremichael]`
`[https://github.com/Mikiyas-STP/]`