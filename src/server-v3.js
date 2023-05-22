/**
 * Simple WebSocket Server
 * Author: Kaifuny
 * LICENSE: MIT
 */
const { createServer } = require("net");
const crypto = require("crypto");

function getSecWebSocketAccept(key) {
  return crypto
    .createHash("sha1")
    .update(key + "258EAFA5-E914-47DA-95CA-C5AB0DC85B11")
    .digest("base64");
}

const server = createServer((socket) => {
  socket.once("data", (data) => {
    const request = data.toString();
    if (request.match(/Upgrade: websocket/)) {
      const headers = request.split("\r\n").slice(1, -2);
      const key = headers
        .find((header) => header.match(/Sec-WebSocket-Key:/))
        .split(" ")[1];
      const secWebSocketVersion = headers
        .find((header) => header.match(/Sec-WebSocket-Version:/))
        .split(" ")[1];
      console.log("====================================");
      console.log("key: ", key);
      console.log("secWebSocketVersion: ", secWebSocketVersion);
      console.log("====================================");
      if (secWebSocketVersion === "13") {
        const secWebSocketAccept = getSecWebSocketAccept(key);
        const response = [
          "HTTP/1.1 101 Switching Protocols",
          "Upgrade: websocket",
          "Connection: Upgrade",
          `Sec-WebSocket-Accept: ${secWebSocketAccept}`,
          "\r\n",
        ].join("\r\n");
        socket.write(response);
      }
    }
  });

  socket.on("data", (data) => {
    const request = data.toString();
    const path = request.split("\r\n")[0].split(" ")[1];
    if (path === "/websocket") {
      return;
    }
    /*
      Frame format:
        0                   1                   2                   3
        0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
        +-+-+-+-+-------+-+-------------+-------------------------------+
        |F|R|R|R| opcode|M| Payload len |    Extended payload length    |
        |I|S|S|S|  (4)  |A|     (7)     |             (16/64)           |
        |N|V|V|V|       |S|             |   (if payload len==126/127)   |
        | |1|2|3|       |K|             |                               |
        +-+-+-+-+-------+-+-------------+ - - - - - - - - - - - - - - - +
        |     Extended payload length continued, if payload len == 127  |
        + - - - - - - - - - - - - - - - +-------------------------------+
        |                               |Masking-key, if MASK set to 1  |
        +-------------------------------+-------------------------------+
        | Masking-key (continued)       |          Payload Data         |
        +-------------------------------- - - - - - - - - - - - - - - - +
        :                     Payload Data continued ...                :
        + - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - +
        |                     Payload Data continued ...                |
        +---------------------------------------------------------------+
    */
    const FIN = data[0] & 0b10000000;
    const opcode = data[1] & 0b00001111;
    const MASK = data[1] & 0b100000000;
    const payloadLength = data[1] & 0b01111111;
    const maskingKey = data.slice(2, 6);
    const payloadData = data.slice(6);
    const decode = payloadData.map((v, i) => v ^ maskingKey[i % 4]);
    console.log("====================================");
    console.log("FIN: ", FIN);
    console.log("opcode: ", opcode);
    console.log("MASK: ", MASK.toString(2));
    console.log("payloadLength: ", payloadLength);
    console.log("maskingKey: ", maskingKey);
    console.log("payloadData: ", payloadData);
    console.log("decode: ", decode.toString()); // client send string
    console.log("====================================");

    // frame response
    const response = Buffer.from([
      0b10000001, payloadLength, ...decode.toString().split("").map(v => v.charCodeAt(0))
    ]);
    socket.write(response);
    socket.end();
  });
});

server.on("connection", (data) => {
  console.log("server connection");
});

server.listen(8888, () => {
  console.log("server is running on port 8888");
});
