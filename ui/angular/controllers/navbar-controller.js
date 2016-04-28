(function (angular, $, localStorage) {
    'use strict';
    window.app.controller('Navbar', ['$scope', '$location', 'IndexedDBService', 'LoaderService', function ($scope, $location, dbService, loaderService) {

        var self = this;

        $scope.avatar = '';
        $scope.user = '';
        $scope.profileUrl = '';

        this.refresh = function () {
            $scope.avatar = localStorage.getItem('github_avatar_url');
            $scope.user = localStorage.getItem('github_login');
            $scope.profileUrl = localStorage.getItem('github_url');
        };


        this.refresh()
        $scope.$on('bootstrap-completed', function () {
            self.refresh();
        });

    }]);
})(window.angular, window.jQuery, window.localStorage);
