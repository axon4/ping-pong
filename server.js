const server = require('http').createServer();
const IO = require('socket.io')(server);

const PORT = 3001;

IO.on('connection', socket => {
	console.log('user connected');
});

server.listen(PORT, () => {console.log(`server listening on port: ${PORT}`)});