(function () {
    'use strict';

    angular
        .module('app')
        .factory('MapService', MapService);

    MapService.$inject = ['Dynamo', '$q'];
    function MapService(dynamo, $q) {
        var map, poly, roads = [];
        var filter;
        var service = {};

        service.initMap = function (elem) {
            map = new google.maps.Map(elem, {
                zoom: 13,
                center: new google.maps.LatLng(41.7166, 44.7833)
            });

            poly = new google.maps.Polyline({
                strokeColor: '#000000',
                strokeOpacity: 1.0,
                strokeWeight: 3
            });
            poly.setMap(map);

            // Add a listener for the click event
            map.addListener('click', addLatLng);

            // Handles click events on a map, and adds a new point to the Polyline.
            function addLatLng(event) {
                var path = poly.getPath();

                // Because path is an MVCArray, we can simply append a new coordinate
                // and it will automatically appear.
                path.push(event.latLng);

            }
        };

        service.placeRoad = function (road, color) {
            var p = new google.maps.Polyline({
                path: road,
                strokeColor: color || '#000000',
                strokeOpacity: 1.0,
                strokeWeight: 3
            });
            p.setMap(map);
            roads.push(p);
            return p;
        };

        service.clearRoads = function () {
            angular.forEach(roads, function (road) {
                road.setMap(null);
            });
            roads = [];
        };

        service.showMyRoads = function () {
            var deferred = $q.defer();
            service.clearRoads();
            var promise;
            if (filter){
                promise = dynamo.getFilteredLocationsOfUser(AWS.config.credentials.identityId, filter.startDate, filter.endDate);
            }else{
                promise = dynamo.getLocationsOfUser(AWS.config.credentials.identityId);
            }
            promise
                .then(function (data) {
                    var roads = splitRoad(data.Items);
                    angular.forEach(roads, function (road) {
                        service.placeRoad(road.map(function (item) {
                            return new google.maps.LatLng(item.latitude.N, item.longitude.N);
                        }), getRandomColor());
                    });
                    deferred.resolve();
                });
            // dynamo.getFilteredLocationsOfUser(AWS.config.credentials.identityId, filter.startDate, filter.endDate)
            //     .then(function (data) {
            //         angular.forEach(data.Items, function (item) {
            //             var color = getRandomColor();
            //             var promise;
            //             if (filter){
            //                 promise = dynamo.getFilteredLocationsOfUser(item.userId.S, filter.startDate, filter.endDate);
            //             }else{
            //                 promise = dynamo.getLocationsOfUser(item.userId.S);
            //             }
            //             promise
            //                 .then(function (data) {
            //                     var roads = splitRoad(data.Items);
            //                     angular.forEach(roads, function (road) {
            //                         service.placeRoad(road.map(function (item) {
            //                             return new google.maps.LatLng(item.latitude.N, item.longitude.N);
            //                         }), color);
            //                     });
            //                     deferred.resolve();
            //                 });
            //         });
            //     });
            return deferred.promise;
        };

        service.updateFilter = function(f){
            filter = f;
            if (currentUsers === 'freeUsers'){
                return service.showMyRoads();
            }
        };

        return service;
    }


    function getRandomColor() {
        var letters = '0123456789ABCDEF'.split('');
        var color = '#';
        for (var i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    }

    function splitRoad(road) {
        if (road && road.length > 0) {
            var result = [];
            var cur = [];
            var ses = road[0].sessionId.S;
            for (var i = 0; i < road.length; i++) {
                if (road[i].sessionId.S === ses) {
                    cur.push(road[i]);
                } else {
                    result.push(cur);
                    ses = road[i].sessionId.S;
                    cur = [road[i]];
                }
            }
            if (cur.length > 0) {
                result.push(cur);
            }
            return result;
        }
    }
})();