(function () {
    'use strict';

    angular
        .module('app')
        .factory('Dynamo', Dynamo);

    Dynamo.$inject = ['$q'];
    function Dynamo($q) {
        var free_users_table = 'admove-mobilehub-297572719-FreeUsers';
        var locations_table = 'admove-mobilehub-297572719-Locations';
        var dynamodb;

        var service = {};

        service.getLocationsOfUser = function (userId) {
            if (!dynamodb) {
                dynamodb = new AWS.DynamoDB();
            }
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
            if (!dynamodb) {
                dynamodb = new AWS.DynamoDB();
            }
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

        return service;

        function callWithParams(params, fun) {
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