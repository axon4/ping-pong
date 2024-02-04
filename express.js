const express = require('express');

const server = express();

server.use(express.static(__dirname));

server.use('/', express.static('index.html'));

module.exports = server;