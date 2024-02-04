const HTTP = require('http');
const IO = require('socket.io');
const express = require('./express');
const socket = require('./socket');

const HTTPServer = HTTP.createServer(express);

const socketServer = IO(HTTPServer, {
	cors: {
		origin: '*',
		methods: ['GET', 'POST']
	}
});

const PORT = 3001;

HTTPServer.listen(PORT, () => {console.log(`server listening on port: ${PORT}`)});

socket.listen(socketServer);