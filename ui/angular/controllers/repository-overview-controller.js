(function (angular, $) {
    'use strict';

    var markdown = require("markdown").markdown;

    window.app.controller('Overview', ['$scope', '$rootScope', '$location', '$timeout', 'GithubService', 'LoaderService', 'TagService', 'sharedData',
        function ($scope, $rootScope, $location, $timeout, githubService, loaderService, tagService, sharedData) {

            var self = this;

            $scope.shared = sharedData;
            $scope.repositories = [];
            $scope.tags = [];
            $scope.repositoryTags = [];
            $scope.tagEditorVisible = false;


            this.refresh = function () {

                $scope.tagEditorVisible = false;

                if (!sharedData.repository)
                    return;

                sharedData.readmeContent = '';


                githubService.getRepositoryReadme(sharedData.repository, function (error, response) {
                    sharedData.readmeContent = markdown.toHTML(atob(response.body.content));

                    $scope.repositoryTags = [];
                    angular.forEach(sharedData.repository._user_tags, function (name) {
                        $scope.repositoryTags.push({name: name});
                    });

                    $scope.$apply()
                });
            };

            this.loadTags = function (callback) {
                callback = typeof callback == 'function' ? callback : angular.noop;
                tagService.getTags(function (tags) {
                    $scope.tags = tags;
                    callback();
                });
            };

            $scope.showTagEditor = function () {
                var $tagEditorContainer = $('.select-tag-container');
                var $select = $tagEditorContainer.find('select');
                var select2Options = {
                    minimumResultsForSearch: 1,
                    data: $scope.tags
                };

                $tagEditorContainer.css('opacity', 0);
                $scope.tagEditorVisible = true;

                $select.select2(select2Options);
                $tagEditorContainer.animate({opacity: 1});

                $select.on("select2:select", function (e) {
                    var tagName = e.params.data.text;
                    self.addTag(tagName);
                });
                $select.on("select2:unselect", function (e) {
                    var tagName = e.params.data.text;
                    self.removeTag(tagName);
                });
                $scope.$on('tag-added', function () {
                    self.loadTags(function () {
                        $timeout(function () {
                            $scope.$apply();
                            $timeout(function () {
                                $select.select2('destroy');
                                $select.select2(select2Options);
                            });
                        });
                    });
                });
            };

            this.addTag = function (tagName) {
                tagService.addTagToRepository(sharedData.repository, tagName, function () {
                    sharedData.repository._user_tags.push(tagName);
                    $timeout(function () {
                        $scope.$apply();
                    });
                });
            };

            this.removeTag = function (tagName) {
                tagService.removeTagFromRepository(sharedData.repository, tagName, function () {
                    for (var i in  sharedData.repository._user_tags) {
                        if (sharedData.repository._user_tags[i].toLowerCase() == tagName.toLowerCase()) {
                            sharedData.repository._user_tags.splice(i, 1);
                        }
                    }
                    $timeout(function () {
                        $scope.$apply();
                    });
                });
            };

            this.refresh();
            this.loadTags();

            $scope.$on('bootstrap-completed', this.refresh);
            $scope.$on('shared-data:repository-update', this.refresh);
            $scope.$on('sync-completed', this.refresh);
            $rootScope.$on('shared-data:tag-update', this.loadTags);

            $rootScope.$on('$viewContentLoaded', function () {
            });

        }]);
})(window.angular, window.jQuery);
