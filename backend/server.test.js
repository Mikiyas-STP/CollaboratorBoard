const { server } = require("./server"); // Import your REAL server
const Client = require("socket.io-client");
const fetch = require("node-fetch");
test("should handle the full action lifecycle: add action, clear action, and broadcast", async () => {
  return new Promise((resolve, reject) => {
    let client1;
    let client2;
    server.listen(0, async () => {
      const port = server.address().port;
      const baseUrl = `http://localhost:${port}`;

      try {
        client1 = new Client(baseUrl);
        client2 = new Client(baseUrl);
        client2.on("action", (action) => {
          expect(action.type).toBe("final_action");
          resolve(); // The entire test is successful!
        });
        await new Promise((res) => client1.on("connect", res));
        const drawAction = { type: "draw", data: "some-data-1" };
        client1.emit("action", drawAction);
        await new Promise((res) => setTimeout(res, 50)); // Wait for server to process

        let historyResponse = await fetch(`${baseUrl}/history`);
        let history = await historyResponse.json();
        expect(history.length).toBe(1);
        expect(history[0]).toEqual(drawAction);
        console.log("✓ Correctly added an action to history.");
        const clearAction = { type: "clear" };
        client1.emit("action", clearAction);
        await new Promise((res) => setTimeout(res, 50));

        historyResponse = await fetch(`${baseUrl}/history`);
        history = await historyResponse.json();
        expect(history.length).toBe(0);
        console.log("✓ Correctly cleared the history.");
        const finalAction = { type: "final_action", data: "some-data-2" };
        client1.emit("action", finalAction);
        console.log("✓ Correctly broadcasted the final action.");
      } catch (error) {
        reject(error); // If any expect() fails, the test will fail.
      }
    });
    server.on("close", () => {
      if (client1) client1.close();
      if (client2) client2.close();
    });
  });
}, 10000); // 10-second timeout for the entire test
afterAll((done) => {
  server.close(done);
});
