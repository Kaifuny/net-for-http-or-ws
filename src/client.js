const net = require('net');

const client = net.createConnection({ port: 8888 }, () => {
    console.log('connected to server!');
    client.write('ping');
});

client.on('data', (data) => {
    console.log(data.toString());
    client.end();
});
