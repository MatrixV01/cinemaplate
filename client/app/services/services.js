'use strict';

angular.module('cinePlate.services', [])

.factory('Matches', ['$http', '$location', function($http, $location) {

  var generateMatch = function(zip, data) {
    return $http({
        method: 'POST',
        url: '/api/match/' + zip,
        data: data
      })
      .then(function(resp) {
        return resp.data;
      })
      .catch(function(err) {
        $location.path('/500');
        return
      });
  };

  var generate1stMatch = function(zip) {
    return $http({
        method: 'GET',
        url: '/api/match/' + zip
      })
      .then(function(resp) {
        return resp.data;
      })
      .catch(function(err) {
        $location.path('/500');
        return err
      });
  };

  var saveWork = function(data) {
    return $http({
        method: 'POST',
        url: '/saveWork',
        data: data
      })
      .then(function(resp) {
        return resp.data;
      })
      .catch(function(err) {
        if (err.data.Error) {
          $location.path('/signin')
        }
        console.log("Error in save movie/tv ", err)
        return
      });
  };

  var saveCombo = function(data) {
    return $http({
        method: 'POST',
        url: '/saveCombo',
        data: data
      })
      .then(function(resp) {
        return resp.data;
      })
      .catch(function(err) {
        if (err.data.Error) {
          $location.path('/signin')
        }
        console.log("Error in save Combo ", err)
        return
      });
  };

  var saveRestaurant = function(data) {
    return $http({
        method: 'POST',
        url: '/saveRestaurant',
        data: data
      })
      .then(function(resp) {
        return resp.data;
      })
      .catch(function(err) {
        if (err.data.Error) {
          $location.path('/signin')
        }
        console.log("Error in save restaurant ", err)
        return
      });
  };

  return {
    generateMatch: generateMatch,
    generate1stMatch: generate1stMatch,
    saveRestaurant: saveRestaurant,
    saveCombo: saveCombo,
    saveWork: saveWork
  };
}])


.factory('Auth', ['$http', '$location', function($http, $location) {
  var signin = function(user) {
    return $http({
        method: 'POST',
        url: '/signin',
        data: user
      })
      .then(function(resp) {
        return resp.data;
      })
      .catch(function(err) {
        console.error("There was an error in Signin services ", err)
        return err.data
      })
  };

  var signup = function(user) {
    return $http({
        method: 'POST',
        url: '/signup',
        data: user
      })
      .then(function(resp) {
        return resp.data;
      })
      .catch(function(err) {
        console.error("There was an error in Signup services ", err)
        return err.data
      })
  };

  var fetchUser = function() {
    return $http({
        method: 'GET',
        url: '/userCombos'
      })
      .then(function(resp) {
        return resp.data;
      })
      .catch(function(err) {
        console.error("There was an error ", err)
        return err.data;
      })
  };

  var changeStats = function(newStats) {
    return $http({
        method: 'POST',
        url: '/alterUserInfo',
        data: newStats
      })
      .then(function(resp) {
        return resp.data;
      })
      .catch(function(err) {
        console.error("There was an error ", err)
        return err.data
      })
  }

  var signout = function() {
    return $http({
        method: 'GET',
        url: '/signout'
      })
      .then(function(resp) {
        console.log("User is signed out")
        $location.path('/')
      })
      .catch(function(err) {
        console.error("There was an error signing out")
      })
  };


  return {
    signin: signin,
    signup: signup,
    fetchUser: fetchUser,
    changeStats: changeStats,
    signout: signout
  }
}])

.factory('Nav', ['$http', '$location', function($http, $location) {
  var profilePage = function() {
    $location.path('/userProfile')
  };

  var signin = function() {
    $location.path('/signin')
  };

  var signup = function() {
    $location.path('/signup')
  };

  var home = function() {
    $location.path('/')
  };

  var matches = function(zip) {
    $location.path('/' + zip)
  }

  return {
    profilePage: profilePage,
    signin: signin,
    signup: signup,
    home: home,
    matches: matches
  }
}])
