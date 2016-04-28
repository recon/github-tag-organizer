(function (angular, $) {
    'use strict';

    window.location.hash = "#";

    var app = angular.module('app', ['ngRoute']);
    app.bootstraped = false;

    app.config(function ($httpProvider) {
        // Converts json to query string on $http requests
        $httpProvider.defaults.transformRequest = function (data) {
            if (data === undefined) {
                return data;
            }

            return $.param(data);
        }

        // Set default headers
        $httpProvider.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded; charset=UTF-8';
        $httpProvider.defaults.headers.common['X-Angular'] = 'true';
    });


    app.config(['$routeProvider', '$locationProvider', function ($routeProvider, $locationProvider) {
        $locationProvider.html5Mode(false);

        $routeProvider
            .when('/repositories/?', {
                templateUrl: 'templates/repositories.html',
            })
            .when('/', {
                templateUrl: 'templates/home.html',
                controller: 'Index'
            })
            .otherwise({
                redirectTo: '/'
            });
    }]);


    app.run(['$rootScope', '$location', 'GithubService', 'IndexedDBService', 'LoaderService', 'DataSyncService',
        function ($rootScope, $location, githubService, indexedDBService, loaderService, dataSyncService) {

            $rootScope.$on('bootstrap-completed', function () {
                app.bootstraped = true;
                dataSyncService.sync();
            });

            loaderService.listener.then(function (error, results) {
                // Now the token is set and the database is loaded

                if (error) {
                    // Error
                }
                else {
                    // Redirect to the starred repositories page
                    var event = $rootScope.$broadcast('bootstrap-completed');
                }
            });

        }]);


    app.run(function ($rootScope, $location, $timeout) {
        $rootScope.$on('$routeChangeSuccess', function (event, next, current) {
            $rootScope.$emit('ui-component-update');
        });

        $rootScope.$on('ui-component-update', function () {

        });
    });

    app.factory("CustomServerErrorHttpInterceptor", function ($q) {
        return {
            response: function (response) {
                if (response.data.status && (response.data.status === 400)) {
                    return $q.reject(response);
                }
                return response || $q.when(response);
            }
        };
    });

    app.factory('sharedData', function () {
        return {
            tag: null,  // current tag
            repository: null, // current repository
            readmeContent: null // readme of current repository
        };
    });

    app.config(function ($httpProvider) {
        $httpProvider.interceptors.push("CustomServerErrorHttpInterceptor");
    });

    app.filter('capitalize', function () {
        return function (input, scope) {
            return input.substring(0, 1).toUpperCase() + input.substring(1);
        }
    });

    app.filter('unsafe', function ($sce) {
        return $sce.trustAsHtml;
    });

    window.app = app;

})(window.angular, window.jQuery);
