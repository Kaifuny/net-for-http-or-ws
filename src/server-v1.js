const net = require('net');

const server = net.createServer((socket) => {
    socket.on('data', (data) => {
        console.log(data.toString());
        // pong
        socket.write('pong');
        socket.end();
    });
});

server.listen(8888, () => {
    console.log('server is running on port 8888');
});
