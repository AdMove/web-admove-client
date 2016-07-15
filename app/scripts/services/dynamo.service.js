(function () {
    'use strict';

    angular
        .module('app')
        .factory('Dynamo', Dynamo);

    Dynamo.$inject = ['$q'];
    function Dynamo($q) {
        var users_table = 'admove-mobilehub-297572719-UsersData';
        var locations_table = 'admove-mobilehub-297572719-Locations';
        var dynamodb;

        var service = {};

        service.getLocationsOfUser = function (userId) {
            var params = {
                TableName: locations_table,
                KeyConditionExpression: "userId = :uid",
                ExpressionAttributeValues: {
                    ":uid": {S: userId}
                }
            };
            return callWithParams(params);
        };

        service.getFilteredLocationsOfUser = function (userId, startDate, endDate) {
            var params = {
                TableName: locations_table,
                KeyConditionExpression: 'userId = :uid',
                FilterExpression: 'sessionId between :start and :end',
                ExpressionAttributeValues: {
                    ':uid': {S: userId},
                    ':start': {S: startDate},
                    ':end': {S: endDate}
                }
            };
            return callWithParams(params);
        };

        service.saveUserSettings = function(uid, settings){
            var item = {
                'userId': {S: uid},
                'hasAdvertisment': {N: '0'}  // ჯერჯერობით ესე იყოს
            };
            if (settings.car_maker) {
                item.carProducer = {S: settings.car_maker};
            }
            if (settings.car_model) {
                item.carModel = {S: settings.car_model};
            }
            if (settings.car_year) {
                item.carProductionYear = {S: settings.car_year+''};
            }
            if (settings.phone_number) {
                item.phoneNumber = {S: settings.phone_number};
            }
            if (settings.take_suggestions !== undefined) {
                item.takeSuggestions = {N: settings.take_suggestions ? '1' : '0'};
            }
            var params = {
                TableName: users_table,
                Item: item
            };
            console.log(params);
            return callWithParams(params, 'putItem');
        };

        service.getUserSettings = function(uid){
            var params = {
                TableName: users_table,
                Key: {
                    userId: {S: uid}
                }
            };
            return callWithParams(params, 'getItem');
        };

        return service;

        function callWithParams(params, fun) {
            if (!dynamodb) {
                dynamodb = new AWS.DynamoDB();
            }
            var deferred = $q.defer();
            dynamodb[fun || 'query'](params, function (e, data) {
                if (e) {
                    console.log(e);
                    deferred.reject(e);
                }
                deferred.resolve(data);
            });
            return deferred.promise;
        }
    }
})();