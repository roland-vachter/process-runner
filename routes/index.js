"use strict";

var express = require('express');
var router = express.Router();

const instrumentator = require('../app/instrumentator');

/* GET home page. */
router.get('/start-all', function(req, res, next) {
	let status = instrumentator.startAll();

	res.json({
		ok: status
	});
});

router.get('/restart-all', function(req, res, next) {
	let status = instrumentator.restartAll();

	res.json({
		ok: status
	});
});

router.get('/stop-all', function(req, res, next) {
	let status = instrumentator.stopAll();

	res.json({
		ok: status
	});
});

router.get('/start/:id', function (req, res, next) {
	let status = instrumentator.start(req.params.id);

	res.json({
		ok: status
	});
});

router.get('/restart/:id', function (req, res, next) {
	let status = instrumentator.restart(req.params.id);

	res.json({
		ok: status
	});
});

router.get('/stop/:id', function (req, res, next) {
	let status = instrumentator.stop(req.params.id);

	res.json({
		ok: status
	});
});

router.get('/logs/:id', function (req, res, next) {
	instrumentator.getLogs(req.params.id).then((logs) => {
		res.send(logs);
	}).catch((err) => {
		console.warn(err);
		res.sendStatus(err.statusCode || 503);
	});
});

router.get('/status', function (req, res, next) {
	let status = instrumentator.getStatus();

	res.json(status);
});

module.exports = router;
