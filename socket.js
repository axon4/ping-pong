let readyPlayers = 0;

function listen(IO) {
	IO.on('connection', socket => {
		console.log('client connected:', socket.id);

		socket.on('ready', () => {
			console.log('player ready:', socket.id);

			readyPlayers++;

			if (readyPlayers % 2 === 0) {
				IO.emit('start', socket.id);
			};
		});

		socket.on('paddleMove', paddle => {
			socket.broadcast.emit('paddleMove', paddle);
		});

		socket.on('ballMove', ball => {
			socket.broadcast.emit('ballMove', ball);
		});

		socket.on('disconnect', reason => {
			console.log(`client ${socket.id} disconnected: ${reason}`);
		});
	});
};

module.exports = { listen };