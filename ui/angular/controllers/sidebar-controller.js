(function (angular, $) {
    'use strict';
    window.app.controller('Sidebar', ['$scope', '$rootScope', '$location', 'IndexedDBService', 'TagService', 'LoaderService', 'sharedData',
        function ($scope, $rootScope, $location, dbService, tagService, loaderService, sharedData) {

            var self = this;

            $scope.tags = [];
            $scope.tagFormData = {
                name: ''
            };
            $scope.addTagFormIsVisible = false;
            $scope.shared = sharedData;

            $scope.$on('bootstrap-completed', function () {

            });

            $scope.toggleAddTagForm = function () {
                $scope.addTagFormIsVisible = !$scope.addTagFormIsVisible;
            };

            $scope.saveNewTag = function () {
                var name = $.trim($scope.tagFormData.name.toLowerCase());
                if (!name)
                    return;

                tagService.saveTag(name, function (tagObject) {
                    $scope.tagFormData.name = '';
                    $scope.addTagFormIsVisible = false;
                    self.refresh();

                    $scope.$apply();
                });
            };

            $scope.selectTag = function (tag) {
                $scope.shared.tag = tag;
                $rootScope.$broadcast('shared-data:tag-update');
            };

            this.getTagObjectStore = function () {
                return dbService.db.transaction(['tags'], 'readwrite').objectStore('tags');
            };

            this.getRepositoryObjectStore = function () {
                return dbService.db.transaction(['starred-repositories'], 'readonly').objectStore('starred-repositories');
            };

            this.refresh = function () {
                if (!dbService.db)
                    return;

                tagService.getTags(function (tags) {
                    $scope.tags = tags;
                    $scope.$apply();
                });

            };


            this.refresh()
            $scope.$on('bootstrap-completed', this.refresh);
            $scope.$on('sync-completed', this.refresh);
            $scope.$on('tag-added', this.refresh);
            $scope.$on('repository-tag-update', this.refresh); // to update counters
        }]);
})(window.angular, window.jQuery);
