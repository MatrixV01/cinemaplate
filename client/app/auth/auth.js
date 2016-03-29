angular.module('cinePlate.auth', [])

.controller('AuthCtrl', function($scope, $window, $location, Auth) {
  $scope.user = {
    username: '',
    password: '',
    location: '',
    email: ''
  };

  $scope.userStats = {};


  $scope.signin = function() {
    Auth.signin($scope.user)
      .then(function(resp) {
        if (!!resp.error) {
          console.log(resp.error)
          $scope.error = resp.error
        } else {
          var location = resp.user.location
          $location.path('/' + location)
        }
      })
      .catch(function(err) {
        console.error('error in signin ', err)
      })
  };

  $scope.signup = function() {
    Auth.signup($scope.user)
      .then(function(resp) {
        if (!!resp.error) {
          console.log(resp.error)
          $scope.error = resp.error
        } else {
          console.log('response from signup ', resp)
          $location.path('/' + $scope.user.location)
        }
      })
      .catch(function(err) {
        console.error('error in signup ', err)
      })
  };

});
