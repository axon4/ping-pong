let readyPlayers = 0;

function listen(IO) {
	const nameSpace = IO.of('/ping-pong');
	let room;

	nameSpace.on('connection', socket => {
		console.log('client connected:', socket.id);

		socket.on('ready', () => {
			console.log('player ready:', socket.id, '|', 'room:', room);

			room = 'room' + Math.floor(readyPlayers / 2);
			socket.join(room);

			readyPlayers++;

			if (readyPlayers % 2 === 0) {
				nameSpace.in(room).emit('start', socket.id);
			};
		});

		socket.on('paddleMove', paddle => {
			socket.to(room).emit('paddleMove', paddle);
		});

		socket.on('ballMove', ball => {
			// socket.broadcast.emit('ballMove', ball);
			socket.to(room).emit('ballMove', ball);
		});

		socket.on('disconnect', reason => {
			console.log(`client ${socket.id} disconnected: ${reason}`);
			socket.leave(room);
		});
	});
};

module.exports = { listen };