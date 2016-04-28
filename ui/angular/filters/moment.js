(function (angular, $, laroute) {
    'use strict';
    window.app.filter('momentjs', function () {
        return function (input) {
            return moment(input).toDate();
        };
    });
})(angular, window.jQuery, laroute);
