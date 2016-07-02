(function () {
    'use strict';

    angular
        .module('app')
        .controller('LoginController', LoginController);

    LoginController.$inject = ['$scope', '$cookies', 'NavigationService', 'AuthService', '$timeout'];
    function LoginController($scope, $cookies, ns, as, $timeout) {
        $scope.goRegister = ns.goRegister;

        $scope.fbLogin = function () {
            FB.login(function (response) {
                if (response.status === 'connected') {
                    as.login('graph.facebook.com', response.authResponse.accessToken, function (callback) {
                        FB.api('/me', function (data) {
                            callback({email: data.email, name: data.name, picture: data.picture.data.url});
                        }, {fields: 'name,email,picture'});
                    });
                }
            }, {scope: 'public_profile,email'});
        };

        $scope.$on('$viewContentLoaded', function () {
            var provider = $cookies.get('client.auth_provider');
            var token = $cookies.get('client.auth_token');
            if (provider && token) {
                var logins = {};
                logins[provider] = token;
                AWS.config.credentials = new AWS.CognitoIdentityCredentials({
                    IdentityPoolId: 'us-east-1:1819e837-0832-4192-a44a-7a9df4b29bb0',
                    Logins: logins
                });
                AWS.config.credentials.get(function (err) {
                    console.log('resp: ' + err);
                    if (err) {
                        $scope.$emit('_content-loaded');
                        return console.log("Error", err);
                    }
                    $scope.$apply(function () {
                        ns.goHome();
                        $scope.$emit('_content-loaded');
                    });
                });
            } else {
                $timeout(function () {
                    $scope.$emit('_content-loaded');
                });
            }
        });

        $scope.$on('event:google-plus-signin-success', function (event, authResult) {
            var id_token = authResult.hg.id_token;
            as.login('accounts.google.com', id_token, function (callback) {
                var user = gapi.auth2.getAuthInstance().currentUser.hg.wc;
                callback({email: user.hg, name: user.wc, picture: user.Ph});
            });
        });
    }

})();