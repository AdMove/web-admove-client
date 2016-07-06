(function () {
    angular
        .module('app')
        .factory('DialogService', DialogService);

    DialogService.inject = ['$mdDialog'];
    function DialogService($mdDialog) {

        var service = {
            alert: alert,
            prompt: prompt
        };

        return service;

        function alert(title, body, okTitle){
            return $mdDialog.show(
                $mdDialog.alert()
                    // .parent(angular.element(document.querySelector('#popupContainer')))
                    .clickOutsideToClose(true)
                    .title(title)
                    .textContent(body)
                    .ariaLabel('AlertDialog')
                    .ok(okTitle)
            );
        }

        function prompt(title, body, placeholder, okTitle, cancelTitle){
            var confirm = $mdDialog.prompt()
                .title(title)
                .textContent(body)
                .placeholder(placeholder)
                .ariaLabel(placeholder)
                // .targetEvent(ev)
                .ok(okTitle)
                .cancel(cancelTitle);
            return $mdDialog.show(confirm);
        }

    }
})();