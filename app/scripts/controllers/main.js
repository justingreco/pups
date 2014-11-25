'use strict';

angular.module('pupApp')
  .controller('MainCtrl', function ($scope, $http, leafletData) {
    $scope.activeids = [];
    $scope.lots = "BLAH";
    $scope.selectedAddress = undefined;
    $scope.actStatus = [
        {
          label: 'Active Permits',
          value: 'encroach_date_expire > sysdate and ',
          order: 'encroach_date_effect desc'
        },
        {
          label: 'All Permits',
          value: '',
          order: 'encroach_date_effect desc'
        }
      ];
    $scope.selectedStatus = $scope.actStatus[0];
    $scope.address = '';
    $scope.id = 0;
    angular.extend($scope, {
      tiles: {
              url: 'http://{s}.tile.openstreetmap.se/hydda/full/{z}/{x}/{y}.png'
            },
      raleigh: {
        lat: 35.779,
        lng: -78.6436,
        zoom: 14
      },
      searching: false
    });
    $http.get('http://gisdevarc1/dirt-simple-iris/v1/ws_geo_attributequery.php?table=iris.encroachment_view&parameters=encroach_date_expire%3Esysdate&fields=distinct(address_id)').
      success(function (data) {
        angular.forEach(data, function (id, i) {
          $scope.activeids.push(id.ADDRESS_ID);
        });
        $scope.getLots();
      });
    $scope.getLots = function () {
      $http.get('data/encroachment.geojson').success(function (data) {
        $scope.lots = data;
        leafletData.getMap().then(function(map) {
          L.geoJson(data, {
            onEachFeature: function (feature, layer) {
              layer.bindLabel(feature.properties.address);
              layer.on('click', function (e) {
                $scope.getLotInfo(feature.properties.addressid);
                $scope.id = feature.properties.addressid;
                $scope.address = feature.properties.address;
              });
            },
            style: function (feature) {
              var color = 'red';
              if ($scope.activeids.indexOf(feature.properties.addressid.toString()) === -1) {
                color = 'green';
              }
              return {opacity: 1, weight: 2, color: color}
            }
          }).addTo(map);
        });
      });
    };
    $scope.getLotInfo = function (id) {
    $scope.searching = true;
      $http({
        url: 'http://gisdevarc1/dirt-simple-iris/v1/ws_geo_attributequery.php',
        method: 'GET',
        params: {
          table: 'iris.encroachment_view',
          parameters: $scope.selectedStatus.value + ' address_id=' + id,
          order: $scope.selectedStatus.order
        }
      }).
      success(function (data) {
        $scope.searching = false;
        console.log(data);
        angular.forEach(data, function (lot, i) {
          lot.active = moment(lot.ENCROACH_DATE_EXPIRE, 'DD-MMMM-YY').isAfter(moment());
        });
        $scope.selectedLot = data;
      });   
    }
    $http.get('data/outdoor.geojson').success(function (data) {
      leafletData.getMap().then(function(map) {
        L.geoJson(data, {
            onEachFeature: function (feature, layer) {
              layer.bindLabel(feature.properties.address);
              layer.on('click', function (e) {
                $scope.getLotInfo(feature.properties.address_id);
                $scope.id = feature.properties.addressid;
                $scope.address = feature.properties.address;
              });
            }
        }).addTo(map);
      });
    });
    $scope.statusChanged = function () {
      $scope.getLotInfo($scope.id);
    };
    $scope.addressSelected = function (item, model, label) {
      $scope.getLotInfo(item.properties.addressid);
      var gj = L.geoJson(item);
      leafletData.getMap().then(function(map) {
        map.fitBounds(gj.getBounds());
      });
    };
  });