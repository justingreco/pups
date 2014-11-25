'use strict';

/**
 * @ngdoc function
 * @name pupApp.controller:AboutCtrl
 * @description
 * # AboutCtrl
 * Controller of the pupApp
 */
angular.module('pupApp')
  .controller('AboutCtrl', function ($scope) {
    $scope.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];
  });
