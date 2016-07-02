(function () {
    'use strict';

    angular
        .module('app')
        .factory('NavigationService', NavigationService);

    NavigationService.$inject = ['$location'];
    function NavigationService($location) {
        var service = {};

        service.goLogin = function () {
            $location.path('/').replace();
        };

        service.goRegister = function () {
            $location.path('/register').replace();
        };

        service.goHome = function () {
            $location.path('/home').replace();
        };

        return service;
    }
})();