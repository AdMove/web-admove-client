(function () {
    angular
        .module('app')
        .factory('AuthService', AuthService);

    AuthService.$inject = ['$rootScope', '$cookies', 'NavigationService'];
    function AuthService($rootScope, $cookies, ns) {
        var service = {};

        service.login = login;
        service.logout = logout;

        return service;

        function login(provider, id_token, getUser) {
            var logins = {};
            logins[provider] = id_token;
            AWS.config.credentials = new AWS.CognitoIdentityCredentials({
                IdentityPoolId: 'us-east-1:1819e837-0832-4192-a44a-7a9df4b29bb0',
                Logins: logins
            });

            AWS.config.credentials.get(function (err) {
                if (err) return console.log("Error", err);
                $cookies.put('client.auth_provider', provider);
                $cookies.put('client.auth_token', id_token);
                getUser(function(user){
                    $cookies.put('client.user.email', user.email);
                    $cookies.put('client.user.name', user.name);
                    $cookies.put('client.user.photo', user.picture);
                    console.log(user);
                    $rootScope.$apply(function () {
                        ns.goHome();
                    });
                });
            });
        }

        function logout() {
            $cookies.remove('client.auth_provider');
            $cookies.remove('client.auth_token');
            $cookies.remove('client.user.email');
            $cookies.remove('client.user.name');
            $cookies.remove('client.user.photo');
            ns.goLogin();
        }

    }
})();