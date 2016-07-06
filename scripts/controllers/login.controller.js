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
        
        $scope.userLogin = function(){
            $scope.loginProgress = true;
            try {
                var authenticationData = {
                    Username: $scope.email,
                    Password: $scope.password
                };
                var authenticationDetails = new AWSCognito.CognitoIdentityServiceProvider.AuthenticationDetails(authenticationData);
                var poolData = {
                    UserPoolId: 'us-east-1_SDw78NVtv',
                    ClientId: '1j4qenfvkk11dlnq2rrll26au7'
                };
                var userPool = new AWSCognito.CognitoIdentityServiceProvider.CognitoUserPool(poolData);
                var userData = {
                    Username: authenticationData.Username,
                    Pool: userPool
                };
                var cognitoUser = new AWSCognito.CognitoIdentityServiceProvider.CognitoUser(userData);
                cognitoUser.authenticateUser(authenticationDetails, {
                    onSuccess: function (result) {
                        as.login(
                            'cognito-idp.us-east-1.amazonaws.com/us-east-1_SDw78NVtv',
                            result.getIdToken().getJwtToken(),
                            function (callback) {
                                cognitoUser.getUserAttributes(function (err, result) {
                                    if (err) {
                                        alert(err);
                                        return;
                                    }
                                    var data = {};
                                    angular.forEach(result, function (attr) {
                                        data[attr.Name] = attr.Value;
                                    });
                                    console.log(data);
                                    callback(data);
                                    $scope.$apply(function(){
                                        $scope.loginProgress = false;
                                    });
                                });
                            });
                    },

                    onFailure: function (err) {
                        $scope.$apply(function() {
                            $scope.loginProgress = false;
                        });
                        alert(err.message);
                    }
                });
            }catch (err){
                $scope.$apply(function() {
                    $scope.loginProgress = false;
                });
                alert(err.message);
            }
        };

        $scope.$on('event:google-plus-signin-success', function (event, authResult) {
            var id_token = authResult.hg.id_token;
            as.login('accounts.google.com', id_token, function (callback) {
                var user = gapi.auth2.getAuthInstance().currentUser.hg.wc;
                callback({email: user.hg, name: user.wc, picture: user.Ph});
            });
        });
    }

})();