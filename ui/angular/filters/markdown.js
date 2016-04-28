(function (app, markdown) {
    'use strict';
    app.filter('markdown', function () {
        return function (input) {
            return markdown.toHTML(input);
        };
    });
})(app, markdown);
