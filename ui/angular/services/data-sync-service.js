(function (angular, $, app, localStorage) {
    'use strict';

    var DataSyncService = function ($rootScope, githubService, dbService) {
        var self = this;

        this.isSynced = false;
        this._store = null;

        var syncTime = Math.round(Date.now() / 1000);

        this.getStore = function () {
            return dbService.db
                .transaction(['starred-repositories'], 'readwrite')
                .objectStore('starred-repositories');
        };

        this.sync = function () {

            var page = 0;

            var syncPage = function (page) {
                githubService.getStarredRepositories(page, function (error, results) {
                    var repositories = results.body;

                    angular.forEach(repositories, function (repo, k) {
                        self._storeRepository(repo);
                    });

                    if (repositories.length)
                        syncPage(++page);
                    else {
                        console.info('syncing finished');
                        localStorage.setItem('last_sync', syncTime);
                        $rootScope.$broadcast('sync-completed');
                    }
                });
            }

            if (syncTime - (localStorage.getItem('last_sync') || 0) > 60 * 60) {
                // minimum sync interval 1 hour
                syncPage(0);
                console.info('syncing starred repositories');
            }
            else {
                console.info('syncing skiped - performed recently');
            }

            this.isSynced = true;
        }

        this._storeRepository = function (repository) {
            repository._last_sync = syncTime;

            self.getStore()
                .get(repository.id)
                .onsuccess = function (e) {
                {
                    var localRepo = e.target.result;

                    if (localRepo) {
                    if (localRepo) 
                        $.extend(localRepo, repository);
                        self.getStore().put(localRepo);
                    }
                    else {
                        repository._user_tags = ['default'];
                        self.getStore().add(repository);
                    }
                }
            };
        };
    }

    app.factory('DataSyncService', ['$rootScope', 'GithubService', 'IndexedDBService', function ($scope, githubService, indexedDBService) {
        var service = new DataSyncService($scope, githubService, indexedDBService);
        return service;
    }]);

})(window.angular, window.jQuery, window.app, window.localStorage);

