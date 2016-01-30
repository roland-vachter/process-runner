"use strict";

var socketIo = require('socket.io');
var io;


module.exports = function () {
	return io;
};

module.exports.init = function (server) {
	io = socketIo(server);

	io.on('connection', function (socket) {});
};
