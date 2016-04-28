(function (angular, $) {
    'use strict';
    window.app.controller('Index', ['$scope', '$location', function ($scope, $location) {
        $scope.$on('bootstrap-completed', function () {
            $('body > .loader-overlay').fadeOut();

            $location.path('/repositories');
            $scope.$apply();
        });
    }]);
})(window.angular, window.jQuery);
