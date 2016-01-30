"use strict";

const commander = require('commander');
const Process = require('./Process');
const path = require('path');

commander
	.option('-c, --config [string]', 'Config')
	.parse(process.argv);

const config = require(commander.config);

const processes = [];
exports.init = function () {
	config.forEach((item, index) => {
		item.forever.outFile = path.join(__dirname, '/../logs/' + item.name + '.log');

		let proc = new Process(index, item);

		processes.push(proc);
	});
};


exports.start = function (id) {
	if (id < processes.length) {
		processes[id].start();

		return true;
	} else {
		return false;
	}
};

exports.restart = function (id) {
	if (id < processes.length) {
		processes[id].restart();

		return true;
	} else {
		return false;
	}
};

exports.stop = function (id) {
	if (id < processes.length) {
		processes[id].stop();

		return true;
	} else {
		return false;
	}
};

exports.getLogs = function (id) {
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



exports.startAll = function () {
	processes.forEach((proc) => {
		proc.start();
	});

	return true;
};

exports.restartAll = function () {
	processes.forEach((proc) => {
		proc.restart();
	});

	return true;
};

exports.stopAll = function () {
	processes.forEach((proc) => {
		proc.stop();
	});

	return true;
};

exports.getStatus = function () {
	var status = [];

	processes.forEach((proc) => {
		status[proc.getId()] = {
			name: proc.getName(),
			status: proc.getStatus()
		};
	});

	return status;
};
