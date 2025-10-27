// This file: backend/server.test.js

const { server } = require("./server"); // Import your REAL server
const Client = require("socket.io-client");
const fetch = require("node-fetch");

// We are increasing the default timeout for this test because it starts a real server.
// Jest will wait up to 10 seconds for the promise to resolve.
test("should handle the full action lifecycle: add action, clear action, and broadcast", async () => {
  // We wrap the entire test in a Promise to have full control over when it ends.
  return new Promise((resolve, reject) => {
    let client1;
    let client2;

    // Step 1: Start the server on a random port
    server.listen(0, async () => {
      const port = server.address().port;
      const baseUrl = `http://localhost:${port}`;

      try {
        // Step 2: Connect two clients
        client1 = new Client(baseUrl);
        client2 = new Client(baseUrl);

        // This listener on client2 is for our final broadcast test.
        client2.on("action", (action) => {
          // Step 6: The broadcast was received. This is the final success condition.
          expect(action.type).toBe("final_action");
          resolve(); // The entire test is successful!
        });

        // Wait for client1 to connect before we start doing things.
        await new Promise((res) => client1.on("connect", res));

        // Step 3: Emit a 'draw' action and check the history
        const drawAction = { type: "draw", data: "some-data-1" };
        client1.emit("action", drawAction);
        await new Promise((res) => setTimeout(res, 50)); // Wait for server to process

        let historyResponse = await fetch(`${baseUrl}/history`);
        let history = await historyResponse.json();
        expect(history.length).toBe(1);
        expect(history[0]).toEqual(drawAction);
        console.log("✓ Correctly added an action to history.");

        // Step 4: Emit a 'clear' action and check the history again
        const clearAction = { type: "clear" };
        client1.emit("action", clearAction);
        await new Promise((res) => setTimeout(res, 50));

        historyResponse = await fetch(`${baseUrl}/history`);
        history = await historyResponse.json();
        expect(history.length).toBe(0);
        console.log("✓ Correctly cleared the history.");

        // Step 5: Emit a final action to test the broadcast to client2
        const finalAction = { type: "final_action", data: "some-data-2" };
        client1.emit("action", finalAction);
        console.log("✓ Correctly broadcasted the final action.");
      } catch (error) {
        reject(error); // If any expect() fails, the test will fail.
      }
    });

    // This ensures that no matter what, we clean up after the test.
    server.on("close", () => {
      if (client1) client1.close();
      if (client2) client2.close();
    });
  });
}, 10000); // 10-second timeout for the entire test

// Add this after the test to ensure the server always closes.
afterAll((done) => {
  server.close(done);
});
