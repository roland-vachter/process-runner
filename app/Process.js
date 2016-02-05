"use strict";

const forever = require('forever-monitor');
const socket = require('./socket.js');
const fs = require('fs');
const watch = require('watch');
const simpleGit = require('simple-git');
const EventEmitter = require('events');
const npmi = require('npmi');

const Process = function(id, config) {
	let status = 'stopped';
	let self = this;
	let evts = new EventEmitter();

	let proc = new forever.Monitor(config.script, {
		killTree: true,
		minUptime: 2000,
		spinSleepTime: 1000,
		silent: true,
		sourceDir: config.directory,
		watch: false,
		env: config.env,
		outFile: config.outFile
	});

	let git;


	if (config.watch) {
		watch.createMonitor(config.directory, {
			ignoreDotFiles: true
		}, function(monitor) {
			function changed() {
				console.log(config.name, 'file change');

				if (status !== 'stopped') {
					self.restart();
				}
			}

			monitor.on("created", changed);
			monitor.on("changed", changed);
			monitor.on("removed", changed);
		});
	}

	if (config.github) {
		git = simpleGit(config.directory);

		config.github.remote = config.github.remote || 'origin';
		config.github.branch = config.github.branch || 'master';

		git.pull(config.github.remote, config.github.branch, (errGitPull) => {
			if (errGitPull) {
				console.log('git pull error', errGitPull);
				status = 'error';
				return;
			}

			if (config.github.autodeploy) {
				git.log((errGitLog, data) => {
					if (errGitLog) {
						console.log(config.name, 'git log failed', errGitLog);
						return;
					}

					let latestHash = data.latest.hash;

					setInterval(() => {
						if (status !== 'stopped') {
							git.log((errGitLogInterv, data) => {
								if (errGitLogInterv) {
									console.log(config.name, 'git log failed', errGitLogInterv);
									return;
								}

								if (data.latest.hash !== latestHash) {
									console.log(config.name, 'new git log');
									latestHash = data.latest.hash;

									evts.once('stop', () => {
										npmi({
											path: config.directory
										}, (errNpm) => {
											if (errNpm) {
												if (errNpm.code === npmi.LOAD_ERR) {
													console.log('npm load error');
												} else if (errNpm.code === npmi.INSTALL_ERR) {
													console.log('npm install error');
												}

												status = 'error';

												return console.log(errNpm.message);
											}

											self.start();
										});
									});
									self.stop();
								}
							});
						}
					}, 10000);
				});
			}
		});
	}

	this.start = function() {
		if (status === 'stopped') {
			proc.start();
		}
	};

	this.stop = function() {
		proc.stop();
	};

	this.restart = function() {
		status = 'restarted';
		emitStatusUpdate();

		proc.restart();
	};

	this.kill = function () {
		proc.kill();
	};


	this.getName = function() {
		return config.name;
	};

	this.getStatus = function() {
		return status;
	};

	this.getId = function() {
		return id;
	};

	this.getLogs = function() {
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

	function emitStatusUpdate() {
		socket().emit('update', {
			id: id,
			status: self.getStatus()
		});
	}

	proc.on('start', function() {
		status = 'running';
		console.log(config.name + ' started.');

		evts.emit('start');

		emitStatusUpdate();
	});

	proc.on('stop', function() {
		status = 'stopped';
		console.log(config.name + ' stopped.');

		evts.emit('stop');

		emitStatusUpdate();
	});

	proc.on('exit', function() {
		status = 'stopped';
		console.log(config.name + ' exited.');

		evts.emit('exit');

		emitStatusUpdate();
	});

	proc.on('error', function(err) {
		status = 'error';
		console.log(config.name + ' error occured.', err);

		evts.emit('error');

		emitStatusUpdate();
	});

	proc.on('restart', function() {
		status = 'running';
		console.log(config.name + ' restarted.');

		evts.emit('restart');

		emitStatusUpdate();
	});


	if (config.autostart) {
		self.start();
	}
};

module.exports = Process;
