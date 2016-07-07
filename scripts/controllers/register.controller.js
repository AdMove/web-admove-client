(function () {
    'use strict';

    angular
        .module('app')
        .controller('RegisterController', RegisterController);

    RegisterController.$inject = ['$scope', '$cookies', 'NavigationService', '$timeout', 'AuthService', 'DialogService'];
    function RegisterController($scope, $cookies, ns, $timeout, as, ds) {
        $scope.goLogin = ns.goLogin;

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

        $scope.userRegister = function () {
            var poolData = {
                UserPoolId: 'us-east-1_SDw78NVtv',
                ClientId: '1j4qenfvkk11dlnq2rrll26au7'
            };
            var userPool = new AWSCognito.CognitoIdentityServiceProvider.CognitoUserPool(poolData);
            var attributeList = [];

            var dataEmail = {
                Name: 'email',
                Value: $scope.email
            };
            // var dataFirstName = {
            //     Name: 'first_name',
            //     Value: $scope.firstName
            // };
            // var dataLastName = {
            //     Name: 'last_name',
            //     Value: $scope.lastName
            // };
            var dataName = {
                Name: 'name',
                Value: $scope.firstName + ' ' + $scope.lastName
            };
            if ($scope.phoneNumber) {
                var dataPhoneNumber = {
                    Name: 'phone_number',
                    Value: $scope.phoneNumber
                };
            }
            var attributeEmail = new AWSCognito.CognitoIdentityServiceProvider.CognitoUserAttribute(dataEmail);
            // var attributeFirstName = new AWSCognito.CognitoIdentityServiceProvider.CognitoUserAttribute(dataFirstName);
            // var attributeLastName = new AWSCognito.CognitoIdentityServiceProvider.CognitoUserAttribute(dataLastName);
            var attributeName = new AWSCognito.CognitoIdentityServiceProvider.CognitoUserAttribute(dataName);
            var attributePhoneNumber = new AWSCognito.CognitoIdentityServiceProvider.CognitoUserAttribute(dataPhoneNumber);

            attributeList.push(attributeEmail);
            // attributeList.push(attributeFirstName);
            // attributeList.push(attributeLastName);
            attributeList.push(attributeName);
            attributeList.push(attributePhoneNumber);

            userPool.signUp($scope.email, $scope.password, attributeList, null, function (err, result) {
                if (err) {
                    ds.alert(err.message);
                    return;
                }
                promptConfirm(result.user);
            });
        };

        function promptConfirm(cognitoUser){
            ds.prompt('Confirm Account', 'Confirmation code is sent to your email address. Enter code below:', 'Code', 'Submit', 'Resend Code')
                .then(function (code) {
                    confirmUser(cognitoUser, code);
                }, function () {
                    cognitoUser.resendConfirmationCode(function(err, result) {
                        if (err) {
                            ds.alert(err);
                            return;
                        }
                        promptConfirm(cognitoUser);
                    });
                });
        }

        function confirmUser(cognitoUser, code){
            cognitoUser.confirmRegistration(code, true, function(err) {
                if (err) {
                    ds.alert(err);
                    return;
                }
                var authenticationData = {
                    Username: $scope.email,
                    Password: $scope.password
                };
                var authenticationDetails = new AWSCognito.CognitoIdentityServiceProvider.AuthenticationDetails(authenticationData);
                cognitoUser.authenticateUser(authenticationDetails, {
                    onSuccess: function (result) {
                        as.login(
                            'cognito-idp.us-east-1.amazonaws.com/us-east-1_SDw78NVtv',
                            result.getIdToken().getJwtToken(),
                            function (callback) {
                                cognitoUser.getUserAttributes(function (err, result) {
                                    if (err) {
                                        ds.alert(err);
                                        return;
                                    }
                                    var data = {};
                                    angular.forEach(result, function (attr) {
                                        data[attr.Name] = attr.Value;
                                    });
                                    callback(data);
                                });
                            });
                    },

                    onFailure: function (err) {
                        ds.alert(err.message);
                    }
                });
            });
        }
    }

})();