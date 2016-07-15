(function () {
    'use strict';

    angular
        .module('app')
        .controller('IndexController', IndexController);

    IndexController.$inject = ['$rootScope', '$scope'];
    function IndexController($rootScope, $scope) {
        $scope.loaded = false;

        $rootScope.$on('_content-loaded', function () {
            console.log('content-loaded');
            $scope.$apply(function () {
                $scope.loaded = true;
            });
        });
    }
})();