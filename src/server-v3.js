/**
 * Simple WebSocket Server
 * Author: Kaifuny
 * LICENSE: MIT
 */
const { createServer } = require("net");

const server = createServer((socket) => {
  socket.once("data", (data) => {
    const request = data.toString();
    if (data.match(/Upgrade: websocket/)) {
      const headers = request.split("\r\n").slice(1, -2);
      const key = headers
        .find((header) => header.match(/Sec-WebSocket-Key:/))
        .split(" ")[1];
      if (key === undefined) {
        socket.end();
      }
      const response = [
        "HTTP/1.1 101 Switching Protocols",
        "Upgrade: websocket",
        "Connection: Upgrade",
        `Sec-WebSocket-Accept: ${Buffer.from(
          `${key}258EAFA5-E914-47DA-95CA-C5AB0DC85B11`,
          "sha1"
        ).toString("base64")}`,
        "\r\n",
      ].join("\r\n");
      socket.write(response);
    }
  });

  socket.on("data", (data) => {
    const request = data.toString();
    const FIN = request[0];
    const opcode = request[1] & 0b00001111;
    const MASK = request[1] >> 7;
    const payloadLength = request[1] & 0b01111111;
    const maskingKey = request.slice(2, 6);
    const payload = request.slice(6);
    const decoded = payload
      .split("")
      .map((char, index) => String.fromCharCode(char.charCodeAt(0) ^ maskingKey[index % 4].charCodeAt(0)))
      .join("");
    
    console.log("====================================")
    console.log("FIN", FIN);
    console.log("opcode", opcode);
    console.log("MASK", MASK);
    console.log("payloadLength", payloadLength);
    console.log("maskingKey", maskingKey);
    console.log("payload", payload);
    console.log("decoded", decoded);
    console.log("====================================")

    const response = [
      "HTTP/1.1 200 OK",
      "Content-Type: text/plain",
      "Content-Length: 5",
      "\r\n",
      "Hello",
    ].join("\r\n");
    socket.write(response);
    socket.end();
  });
});

server.on("connection", (data) => {
  console.log("server connection", data.toString());
});

server.listen(Config.port, Config.host, () => {
  console.log("server is running on port 8888");
});