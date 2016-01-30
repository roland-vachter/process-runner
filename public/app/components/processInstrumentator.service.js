(function () {
	"use strict";

	angular.module('processMonitor').service('processInstrumentator', handleApi);

	function handleApi (api, socketio) {
		var handleResponse = function (result) {
			return result.data;
		};

		this.getStatus = function () {
			return api.get('/status').then(handleResponse);
		};

		this.listen = function (callback) {
			socketio.on('update', function (data) {
				callback(data);
			});
		};

		this.start = function (id) {
			return api.get('/start/' + id).then(handleResponse);
		};

		this.restart = function (id) {
			return api.get('/restart/' + id).then(handleResponse);
		};

		this.stop = function (id) {
			return api.get('/stop/' + id).then(handleResponse);
		};

		this.startAll = function () {
			return api.get('/start-all').then(handleResponse);
		};

		this.restartAll = function () {
			return api.get('/restart-all').then(handleResponse);
		};

		this.stopAll = function () {
			return api.get('/stop-all').then(handleResponse);
		};
	}
}());
