const http = require('http');
const app = require('./app');

const port = process.env.PORT || 4000;

const server = http.createServer(app);

server.on('listening', () => {
    console.log('server is running at → \x1b[31mhttp://localhost:' + port); //\x1b[31m -> color red
});

server.listen(port);