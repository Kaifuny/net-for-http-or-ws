/**
 * Simple WebSocket Server
 * Author: Kaifuny
 * LICENSE: MIT
 */
const { createServer } = require("net");

const server = createServer((socket) => {
  socket.once("data", (data) => {
    if (data.match(/Upgrade: websocket/)) {
      // TODO: handle websocket
    }
  });

  socket.on("data", (data) => {
    console.log("socket data", data.toString());
  });
});

server.on("connection", (data) => {
  console.log("server connection", data.toString());
});

server.listen(Config.port, Config.host, () => {
  console.log("server is running on port 8888");
});