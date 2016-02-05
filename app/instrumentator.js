"use strict";

const Process = require('./Process');
const path = require('path');
const fs = require('fs');
const env = require('../env');

const config = require(env.configFile);

const processes = [];
exports.init = function() {
	config.forEach((item, index) => {
		let filePath = path.join(__dirname, '/../logs/' + item.name + '.log');

		fs.lstat(filePath, (err, stats) => {
			if (!err && stats && stats.isFile()) {
				fs.unlinkSync(filePath);
			}

			item.outFile = filePath;

			let proc = new Process(index, item);
			processes[index] = proc;
		});
	});
};


exports.start = function(id) {
	if (id < processes.length) {
		processes[id].start();

		return true;
	} else {
		return false;
	}
};

exports.restart = function(id) {
	if (id < processes.length) {
		processes[id].restart();

		return true;
	} else {
		return false;
	}
};

exports.stop = function(id) {
	if (id < processes.length) {
		processes[id].stop();

		return true;
	} else {
		return false;
	}
};

exports.getLogs = function(id) {
	if (id < processes.length) {
		return processes[id].getLogs().catch((err) => {
			throw {
				statusCode: 503,
				error: err
			};
		});
	} else {
		return new Promise((resolve, reject) => {
			reject({
				statusCode: 404,
				error: new Error("Not found")
			});
		});
	}
};



exports.startAll = function() {
	processes.forEach((proc) => {
		proc.start();
	});

	return true;
};

exports.restartAll = function() {
	processes.forEach((proc) => {
		proc.restart();
	});

	return true;
};

exports.stopAll = function() {
	processes.forEach((proc) => {
		proc.stop();
	});

	return true;
};

exports.getStatus = function() {
	var status = [];

	processes.forEach((proc) => {
		status[proc.getId()] = {
			name: proc.getName(),
			status: proc.getStatus()
		};
	});

	return status;
};



function onExit() {
	exports.stopAll();

	console.log('all stopped');
}

process.on('exit', onExit);
process.on('SIGINT', onExit);
process.on('uncaughtException', function(exception) {
	console.log("uncaughtException", exception);

	onExit();
});
