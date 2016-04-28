/**
 * LoaderServices
 */
(function (angular, $, app, indexedDB) {
    'use strict';


    var IndexedDBService = function ($rootScope, loaderService) {
        var self = this;
        var loaderCallback = loaderService.listener('githubtoken');

        this.db = null;

        var openRequest = indexedDB.open("database", 1);
        openRequest.onupgradeneeded = function (e) {

            console.info('performing indexeddb upgrade');

            var db = e.target.result;

            if (!db.objectStoreNames.contains("starred-repositories")) {
                var store = db.createObjectStore("starred-repositories", {keyPath: "id"});

                store.createIndex("id", "id", {unique: true});
                store.createIndex("sync-date", "_last_sync", {unique: false});
                store.createIndex("tags", "_user_tags", {unique: false, multiEntry: true});
            }

            if (!db.objectStoreNames.contains("tags")) {
                var store = db.createObjectStore("tags", {keyPath: "name"});

                store.createIndex("name", "name", {unique: true});
                store.createIndex("count", "count", {unique: false});
            }
        }

        openRequest.onsuccess = function (e) {
            self.db = e.target.result;
            console.info('database ready');
            loaderCallback(null, self.db);
        }
    };

    app.factory('IndexedDBService', ['$rootScope', 'LoaderService', function ($scope, loaderService) {
        var service = new IndexedDBService($scope, loaderService);
        return service;
    }]);

})(window.angular, window.jQuery, window.app, window.indexedDB);

