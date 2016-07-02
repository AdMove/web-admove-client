(function () {
    'use strict';

    angular
        .module('app', ['ngMaterial', 'ngMessages', 'ngRoute', 'ngCookies', 'directive.gsignin'])
        .directive('mapCanvas', mapCanvasDirective)
        .config(config)
        .run(run);

    mapCanvasDirective.$inject = ['MapService'];
    function mapCanvasDirective(ms) {
        return {
            restrict: 'E',
            template: '<div></div>',
            replace: true,
            link: function (scope, element) {
                ms.initMap(element[0]);
            }
        };
    }

    config.$inject = ['$routeProvider', '$mdDateLocaleProvider'];
    function config($routeProvider, $mdDateLocaleProvider) {
        $routeProvider
            .when('/home', {
                controller: 'HomeController',
                templateUrl: 'templates/home.view.html',
                controllerAs: 'vm'
            })

            .when('/', {
                controller: 'LoginController',
                templateUrl: 'templates/login.view.html',
                controllerAs: 'vm'
            })

            .when('/register', {
                controller: 'RegisterController',
                templateUrl: 'templates/register.view.html',
                controllerAs: 'vm'
            })

            .otherwise({redirectTo: '/'});

        $mdDateLocaleProvider.formatDate = function(date) {
            if (date){
                return date.toDateString().substr(4);
            }else{
                return 'Choose Date';
            }
        };
    }

    run.$inject = ['$window'];
    function run($window) {

        $window.fbAsyncInit = function () {
            FB.init({
                appId: '181154708936062',
                status: true,
                cookie: true,
                xfbml: true
            });
        };

        (function (d) {
            var js,
                id = 'facebook-jssdk',
                ref = d.getElementsByTagName('script')[0];

            if (d.getElementById(id)) {
                return;
            }

            js = d.createElement('script');
            js.id = id;
            js.async = true;
            js.src = "//connect.facebook.net/en_US/all.js";

            ref.parentNode.insertBefore(js, ref);

        }(document));
    }

})();