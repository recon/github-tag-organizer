(function (angular, $, app, localStorage) {
    'use strict';

    const BrowserWindow = require('electron').remote.BrowserWindow;
    const apiRequests = require('superagent');

    var GithubService = function ($rootScope, $location, loaderService) {
        var self = this;

        // Your GitHub Applications Credentials
        var options = {
            client_id: '358a3c2145191b6aae8f',
            client_secret: 'd3f800d05bea0a628436eacc3144d89f819ef0a5',
            scopes: ["user"] // Scopes limit access for OAuth tokens.
        };

        var loaderCallback = loaderService.listener('githubtoken');

        this.requestAuthorization = function () {
            // Build the OAuth consent page URL
            var authWindow = new BrowserWindow({
                width: 0,
                height: 0,
                show: false,
                frame: false
            });
            var githubUrl = 'https://github.com/login/oauth/authorize?';

            var authUrl = githubUrl + 'client_id=' + options.client_id + '&scope=' + options.scopes;

            authWindow.webContents.on('did-finish-load', function () {
                if (!authWindow)
                    return;

                authWindow.setSize(1050, 700, true);
                authWindow.center();
                authWindow.restore();
            });

            authWindow.loadUrl(authUrl);
            authWindow.setSkipTaskbar(true);
            authWindow.setMenu(null);
            authWindow.show();
            authWindow.minimize();

            function handleCallback(url) {
                var raw_code = /code=([^&]*)/.exec(url) || null;
                var code = (raw_code && raw_code.length > 1) ? raw_code[1] : null;
                var error = /\?error=(.+)$/.exec(url);

                if (code || error) {
                    // Close the browser if code found or error
                    authWindow.destroy();
                }

                // If there is a code, proceed to get token from github
                if (code) {
                    self.requestGithubToken(options, code);
                } else if (error) {
                    alert('Oops! Something went wrong and we couldn\'t' +
                        'log you in using Github. Please try again.');
                }
            }

            // Handle the response from GitHub
            authWindow.webContents.on('will-navigate', function (event, url) {
                handleCallback(url);
            });

            authWindow.webContents.on('did-get-redirect-request', function (event, oldUrl, newUrl) {
                handleCallback(newUrl);
            });

            // Reset the authWindow on close
            authWindow.on('close', function () {
                authWindow = null;
            }, false);
        };

        this.requestGithubToken = function (options, code) {
            apiRequests
                .post('https://github.com/login/oauth/access_token', {
                    client_id: options.client_id,
                    client_secret: options.client_secret,
                    code: code,
                })
                .end(function (err, response) {
                    if (response && response.ok) {
                        // Success - Received Token.
                        // Store it in localStorage maybe?
                        localStorage.setItem('githubtoken', response.body.access_token);
                        self.updateUserData();
                    } else {
                        // Error - Show messages.
                        console.log(err);
                    }
                });
        };

        this.updateUserData = function () {
            apiRequests
                .get('https://api.github.com/user?access_token=' + localStorage.getItem('githubtoken') + '&page=0')
                .end(function (error, response) {
                    var data = response.body;

                    localStorage.setItem('github_login', data.login);
                    localStorage.setItem('github_avatar_url', data.avatar_url);
                    localStorage.setItem('github_url', data.url);

                    console.info('user data updated');
                    loaderCallback(null);
                });
        }

        this.getStarredRepositories = function (page, callback) {
            apiRequests
                .get('https://api.github.com/users/Recon/starred?access_token=' + localStorage.getItem('githubtoken') + '&page=' + parseInt(page))
                .end(callback);
        }

        this.getRepositoryReadme = function (repository, callback) {
            apiRequests
                .get('https://api.github.com/repos/' + repository.full_name + '/readme' + '?access_token=' + localStorage.getItem('githubtoken'))
                .end(callback);
        }

        this.requestAuthorization();
    }

    app.factory('GithubService', ['$rootScope', '$location', 'LoaderService', function ($scope, $location, loaderService) {
        var service = new GithubService($scope, $location, loaderService);
        return service;
    }]);

})(window.angular, window.jQuery, window.app, window.localStorage);

