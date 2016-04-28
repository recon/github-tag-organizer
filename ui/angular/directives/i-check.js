window.app.directive('icheck', function () {
    return {
        restrict: 'A',
        link: function (scope, element, attributes) {
            $(element).iCheck({
                checkboxClass: 'icheckbox_square-blue',
                radioClass: 'iradio_square-blue'
            });

            // angular change event won't fire, need to call it nicely
            $(element).on('ifChanged', function () {
                element.triggerHandler('click');
            });

            setTimeout(function () {
                $(element).iCheck('update');
            }, 800);
        }
    }
});