'use strict';

angular.module('cinePlate.splash', [])

.controller('SplashCtrl', ['$scope', '$http', '$location', function($scope, $http, $location) {

  $scope.goToSignin = function() {
    $location.path('/signin')
  }

  $scope.goToSignup = function() {
    $location.path('/signup')
  }

  $scope.onlyNumbers = /^[0-9]+$/;

  $scope.zip = '';
  $scope.getZip = function() {
    if ($scope.zip !== '') {
      console.log($scope.zip)
      $location.path('/' + $scope.zip);
    }
  }
}])
