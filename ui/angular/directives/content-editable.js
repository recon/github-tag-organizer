(function (app) {
    app.directive("contenteditable", function () {
        return {
            restrict: "A",
            require: "ngModel",
            link: function ($scope, element, attrs, ngModel) {

                function read() {
                    var val = element.html();
                    val = val.replace(/<.*>/, ' ');
                    ngModel.$setViewValue(val);
                }

                ngModel.$render = function () {
                    element.html(ngModel.$viewValue || "");
                    element[0].setAttribute('contenteditable', false);
                };

                element.bind("blur keyup change", function (e) {
                    if (e.which === 13) {
                        e.cancelBubble = true;
                        e.returnValue = false;
                        element[0].innerHTML = element[0].innerHTML.replace(/<.*>/, ' ')
                        element[0].setAttribute('contenteditable', false);
                        return false;
                    }

                    $scope.$apply(read);
                });
            }
        };
    });
})(app)