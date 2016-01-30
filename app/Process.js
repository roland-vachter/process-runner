"use strict";

const forever = require('forever-monitor');
const socket = require('./socket.js');
const fs = require('fs');

const Process = function (id, config) {
	let proc = new forever.Monitor(config.script, config.forever);
	let status = 'stopped';
	let self = this;

	this.start = function () {
		if (status === 'stopped') {
			proc.start();
		}
	};

	this.stop = function () {
		if (status === 'running' || status === 'error') {
			proc.stop();
		}
	};

	this.restart = function () {
		status = 'restarting';
		emitStatusUpdate();

		proc.restart();
	};


	this.getName = function () {
		return config.name;
	};

	this.getStatus = function () {
		return status;
	};

	this.getId = function () {
		return id;
	};

	this.getLogs = function () {
		return new Promise((resolve, reject) => {
			fs.readFile(config.forever.outFile, (err, data) => {
				if (err) {
					reject(err);
					return;
				}

				resolve(data);
			});
		});
	};

	function emitStatusUpdate () {
		socket().emit('update', {
			id: id,
			status: self.getStatus()
		});
	}

	proc.on('start', function () {
		status = 'running';
		console.log(config.name + ' started.');

		emitStatusUpdate();
	});

	proc.on('stop', function () {
		status = 'stopped';
		console.log(config.name + ' stopped.');

		emitStatusUpdate();
	});

	proc.on('exit', function () {
		status = 'stopped';
		console.log(config.name + ' exited.');

		emitStatusUpdate();
	});

	proc.on('error', function (err) {
		status = 'error';
		console.log(config.name + ' error occured.', err);

		emitStatusUpdate();
	});

	proc.on('restart', function () {
		status = 'running';
		console.log(config.name + ' restarting.');

		emitStatusUpdate();
	});
};

module.exports = Process;
