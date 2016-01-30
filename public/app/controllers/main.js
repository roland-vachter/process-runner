'use strict';

angular.module('processMonitor')
	.controller('MainCtrl', ['$scope', '$timeout', 'processInstrumentator', function($scope, $timeout, processInstrumentator) {
		$scope.cols = ['#', 'Name', 'Status', 'Actions', ''];


		var colorByStatus = {
			error: 'danger',
			running: 'success',
			restarting: 'warning',
			stopped: ''
		};


		processInstrumentator.getStatus().then((data) => {
			for (var key in data) {
				if (data.hasOwnProperty(key)) {
					data[key].color = colorByStatus[data[key].status];
				}
			}

			$scope.processes = data;

			processInstrumentator.listen(function (updatedData) {
				if (updatedData && typeof updatedData.id === 'number' && $scope.processes[updatedData.id]) {
					var obj = $scope.processes[updatedData.id];

					obj.status = updatedData.status;
					obj.color = colorByStatus[obj.status];
				}
			});
		});


		$scope.start = function (id) {
			processInstrumentator.start(id);
		};

		$scope.restart = function (id) {
			processInstrumentator.restart(id);
		};

		$scope.stop = function (id) {
			processInstrumentator.stop(id);
		};

		$scope.startAll = function () {
			processInstrumentator.startAll();
		};

		$scope.restartAll = function () {
			processInstrumentator.restartAll();
		};

		$scope.stopAll = function () {
			processInstrumentator.stopAll();
		};
	}]);
