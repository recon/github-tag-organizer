/**
 * LoaderServices
 */
(function (angular, $, app, localStorage) {
    'use strict';

    var listen = require('listen');

    var LoaderService = function ($rootScope) {
        var self = this;

        /**
         * Usage: fs.readFile('data.json', LoaderService.listener('json))
         *
         * @link http://maxantoni.de/projects/listen.js/examples.html
         */
        this.listener = listen();
    }

    app.factory('LoaderService', ['$rootScope', '$location', function ($scope) {
        var service = new LoaderService($scope);
        return service;
    }]);

})(window.angular, window.jQuery, window.app, window.localStorage);

