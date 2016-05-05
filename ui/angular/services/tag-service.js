(function (angular, $, app, localStorage) {
    'use strict';

    var TagService = function ($rootScope, dbService) {
        var self = this;

        const DEFAULT_TAG = 'default'; // special tag for repositories which don't have a tag (easier to find in indexeddb)

        function getTagObjectStore(type) {
            type = type || 'readwrite';
            return dbService.db.transaction(['tags'], type).objectStore('tags');
        }

        function getRepositoryObjectStore(type) {
            type = type || 'readonly';
            return dbService.db.transaction(['starred-repositories'], type).objectStore('starred-repositories');
        };


        /**
         * Will add the DEFAULT_TAG tag if the tag list  is empty, or remove it if oither tags are present
         */
        function ensureDefaultTagConsistency(repository) {
            var defaultTagIndex = repository._user_tags.indexOf(DEFAULT_TAG);

            if (defaultTagIndex > -1) {
                repository._user_tags.splice(defaultTagIndex, 1);

                return ensureDefaultTagConsistency(repository);
            }

            if (repository._user_tags.length === 0) {
                repository._user_tags.push(DEFAULT_TAG);
            }

            return repository;
        }


        this.getTags = function (callback) {
            if (!dbService.db)
                return;

            callback = callback || angular.noop;
            var tags = [];

            getTagObjectStore().openCursor().onsuccess = function (event) {
                var cursor = event.target.result;
                if (cursor) {
                    var tag = cursor.value;

                    if (tag == DEFAULT_TAG)
                        return;

                    var count = getRepositoryObjectStore()
                        .index('tags')
                        .count(IDBKeyRange.only(tag.name));
                    count.onsuccess = function () {
                        tag.count = count.result;
                        tags.push(tag);
                    }

                    cursor.continue();
                }
                else {
                    callback(tags);
                }
            }
        }

        this.countUntaggedRepositores = function (callback) {
            var count = getRepositoryObjectStore()
                .index('tags')
                .count(IDBKeyRange.only(DEFAULT_TAG));

            count.onsuccess = function () {
                callback(count.result)
            }
        }

        this.saveTag = function (name, callback) {

            if (!name)
                return;

            var tag = {
                name: name.toLowerCase(),
                count: 0
            };
            callback = callback || angular.noop;

            getTagObjectStore().get(name).onsuccess = function (e) {
                if (typeof e.target.result !== 'undefined') {
                    return; // tag exists
                }
                getTagObjectStore().put(tag).onsuccess = function (e) {
                    console.info("added tag '" + name + "'");
                    callback(tag);
                    $rootScope.$broadcast('tag-added', e.target.result);
                };
            }

        }

        this.addTagToRepository = function (repository, tagName, callback) {
            callback = callback || angular.noop;
            tagName = tagName.toLowerCase();
            self.saveTag(tagName);

            getRepositoryObjectStore().get(repository.id).onsuccess = function (e) {
                var repo = e.target.result;

                for (var i in repo._user_tags) {
                    if (repo._user_tags[i] == tagName) {
                        console.log("adding tag to project: " + tagName + " - duplicate, skipping");
                        return;
                    }
                }
                console.log("adding tag to project: " + tagName);
                repo._user_tags.push(tagName);
                repo = ensureDefaultTagConsistency(repo);

                getRepositoryObjectStore('readwrite').put(repo).onsuccess = function () {
                    callback();
                    $rootScope.$broadcast('repository-tag-update', e.target.result);
                }
            };
        }

        this.removeTagFromRepository = function (repository, tagName, callback) {
            callback = callback || angular.noop;
            tagName = tagName.toLowerCase();

            getRepositoryObjectStore().get(repository.id).onsuccess = function (e) {
                var repo = e.target.result;
                var index = repo._user_tags.indexOf(tagName);

                if (index == -1) {
                    console.log("removing tag to project: " + tagName + " - not found, skipping");
                    return;
                }

                console.log("removing tag to project: " + tagName);
                repo._user_tags.splice(index, 1);
                repo = ensureDefaultTagConsistency(repo);

                getRepositoryObjectStore('readwrite').put(repo).onsuccess = function () {
                    callback();
                    $rootScope.$broadcast('repository-tag-update');
                };
            };
        }
    }

    app.factory('TagService', ['$rootScope', 'IndexedDBService', function ($scope, indexedDBService) {
        var service = new TagService($scope, indexedDBService);
        return service;
    }]);

})(window.angular, window.jQuery, window.app, window.localStorage);

