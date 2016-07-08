(function () {
    'use strict';

    angular
        .module('app')
        .controller('HomeController', HomeController)
        .controller('LeftCtrl', LeftCtrl)
        .controller('RightCtrl', RightCtrl);

    HomeController.$inject = ['$scope', '$timeout', '$mdSidenav', '$log', '$cookies', 'AuthService', 'NavigationService', 'MapService', 'DialogService', 'Dynamo'];
    function HomeController($scope, $timeout, $mdSidenav, $log, $cookies, as, ns, ms, ds, dynamo) {
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
                        $scope.$apply(function () {
                            ns.goLogin();
                            $scope.$emit('_content-loaded');
                        });
                        return console.log("Error", err);
                    }
                    $scope.$emit('_content-loaded');
                });
            } else {
                ns.goLogin();
                $timeout(function () {
                    $scope.$emit('_content-loaded');
                });
            }
        });

        $scope.$on('_content-loaded', function () {
            $scope.showMyRoads();
            loadSettings();
        });

        $scope.showMyRoads = function(){
            $scope.selected = 'myRoads';
            ms.showMyRoads(AWS.config.credentials.identityId);
        };

        $scope.showSettings = function(){
            $scope.selected = 'settings';
        };
        
        

        $scope.saveSettings = function(){
            var data = {
                car_maker: $scope.car_maker,
                car_model: $scope.car_model,
                car_year: $scope.car_year,
                take_suggestions: $scope.take_suggestions
            };

            dynamo.saveUserSettings(AWS.config.credentials.identityId, data)
                .then(function(){
                    ds.alert('Your settings saved successfully');
                }, function(e){
                    ds.alert(e.message);
                });
        };

        $scope.user = {
            photo: $cookies.get('client.user.photo'),
            name: $cookies.get('client.user.name'),
            email: $cookies.get('client.user.email')
        };


        $scope.isOpen = false;

        $scope.logout = as.logout;

        $scope.navigationBar = {
            isOpen: false,
            count: 0,
            selectedDirection: 'left'
        };

        $scope.toggleLeft = buildDelayedToggler('left');
        $scope.toggleRight = buildToggler('right');
        $scope.isOpenRight = function () {
            return $mdSidenav('right').isOpen();
        };


        function loadSettings(){
            dynamo.getUserSettings(AWS.config.credentials.identityId)
                .then(function(data){
                    if (data.Item) {
                        $scope.car_maker = data.Item.car_maker ? data.Item.car_maker.S : undefined;
                        $scope.car_model = data.Item.car_model ? data.Item.car_model.S : undefined;
                        $scope.car_year = data.Item.car_year ? parseInt(data.Item.car_year.N) : undefined;
                        $scope.take_suggestions = data.Item.take_suggestions ? data.Item.take_suggestions.BOOL : undefined;
                    }
                }, function(e){
                    ds.alert(e.message);
                });
        }

        /**
         * Supplies a function that will continue to operate until the
         * time is up.
         */
        function debounce(func, wait, context) {
            var timer;
            return function debounced() {
                var context = $scope,
                    args = Array.prototype.slice.call(arguments);
                $timeout.cancel(timer);
                timer = $timeout(function () {
                    timer = undefined;
                    func.apply(context, args);
                }, wait || 10);
            };
        }

        /**
         * Build handler to open/close a SideNav; when animation finishes
         * report completion in console
         */
        function buildDelayedToggler(navID) {
            return debounce(function () {
                $mdSidenav(navID)
                    .toggle()
                    .then(function () {
                        $log.debug("toggle " + navID + " is done");
                    });
            }, 200);
        }

        function buildToggler(navID) {
            return function () {
                $mdSidenav(navID)
                    .toggle()
                    .then(function () {
                        $log.debug("toggle " + navID + " is done");
                    });
            }
        }
    }

    LeftCtrl.$inject = ['$scope', '$timeout', '$mdSidenav', '$log'];
    function LeftCtrl($scope, $timeout, $mdSidenav, $log) {
        $scope.close = function () {
            $mdSidenav('left').close()
                .then(function () {
                    $log.debug("close LEFT is done");
                });
        };
    }

    RightCtrl.$inject = ['$scope', '$timeout', '$mdSidenav', '$log', 'MapService'];
    function RightCtrl($scope, $timeout, $mdSidenav, $log, ms) {

        $scope.filter = function () {
            console.log($scope.startDate);
            var startDate = new Date($scope.startDate || '2000/01/01');
            var endDate = new Date($scope.endDate || '9999/01/01');

            // there is javascript bug and dates need to set (date + 1)
            startDate.setDate(startDate.getDate() + 1);
            endDate.setDate(endDate.getDate() + 2);                             // for inclusive end date

            var s = startDate.toISOString().substr(0, 10).replace(/-/g, '');
            var e = endDate.toISOString().substr(0, 10).replace(/-/g, '');
            ms.updateFilter({
                startDate: s,
                endDate: e
            }).then(function(){
                $scope.close();
            });
        };


        $scope.close = function () {
            $mdSidenav('right').close()
                .then(function () {
                    $log.debug("close RIGHT is done");
                });
        };
    }
})();