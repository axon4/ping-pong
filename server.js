const server = require('http').createServer();
const IO = require('socket.io')(server, {
	cors: {
		origin: '*',
		methods: ['GET', 'POST']
	}
});

const PORT = 3001;
let readyPlayers = 0;

IO.on('connection', socket => {
	console.log('user connected:', socket.id);

	socket.on('ready', () => {
		console.log('player ready:', socket.id);

		readyPlayers++;

		if (readyPlayers === 2) {
			IO.emit('start', socket.id);
		};
	});
});

server.listen(PORT, () => {console.log(`server listening on port: ${PORT}`)});