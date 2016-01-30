'use strict';

angular
	.module('processMonitor', [
		'oc.lazyLoad',
		'ui.router'
	])
	.config(['$stateProvider','$urlRouterProvider','$ocLazyLoadProvider',function ($stateProvider,$urlRouterProvider,$ocLazyLoadProvider) {

		$ocLazyLoadProvider.config({
			debug:false,
			events:true,
		});

		$urlRouterProvider.otherwise('/dashboard/home');

		$stateProvider
			.state('dashboard', {
				url:'/dashboard',
				templateUrl: '/app/views/main.html',
				resolve: {
					loadMyDirectives:function($ocLazyLoad){

					}
				}
			})
			.state('dashboard.home',{
				url:'/home',
				controller: 'MainCtrl',
				templateUrl:'/app/views/home.html',
				resolve: {
					loadMyFiles:function($ocLazyLoad) {
						return $ocLazyLoad.load({
							name:'processMonitor',
							files:[
								'/app/controllers/main.js',
								'/app/components/shared/api.service.js',
								'/app/components/socketio.service.js',
								'/app/components/processInstrumentator.service.js',
							]
						});
					}
				}
			});
	}]);


