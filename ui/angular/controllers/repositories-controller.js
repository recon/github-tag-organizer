(function (angular, $) {
    'use strict';
    window.app.controller('Repositories', ['$scope', '$rootScope', '$location', 'IndexedDBService', 'LoaderService', 'sharedData',
        function ($scope, $rootScope, $location, dbService, loaderService, sharedData) {

            var self = this;

            $scope.shared = sharedData;
            $scope.repositories = [];


            $scope.selectRepository = function (repository) {
                $scope.shared.repository = repository;
                $rootScope.$broadcast('shared-data:repository-update');
            };

            this.getObjectStore = function () {
                return dbService.db.transaction(['starred-repositories'], 'readonly').objectStore('starred-repositories');
            };

            this.refresh = function () {
                if (!dbService.db)
                    return;

                console.info('refreshing view repository list');

                var cursor;
                if (sharedData.tag) {
                    var range = IDBKeyRange.only(sharedData.tag.name);
                    cursor = self.getObjectStore()
                        .index('tags')
                        .openCursor(range);
                }
                else {
                    cursor = self.getObjectStore()
                        .openCursor()
                }

                var repositories = [];

                cursor.onsuccess = function (event) {
                    var cursor = event.target.result;
                    if (cursor) {
                        repositories.push(cursor.value);
                        cursor.continue();
                    }
                    else {
                        $scope.repositories = repositories;
                        $scope.$apply();
                    }
                }
            };

            this.refresh();
            $scope.$on('bootstrap-completed', this.refresh);
            $scope.$on('shared-data:tag-update', this.refresh);
            $scope.$on('sync-completed', this.refresh);
        }]);
})(window.angular, window.jQuery);
