// Require Angular just like we do in Node!
var angular = require('angular');

// We can also require angular modules like npm modules. KAKOW!
var match = require('./match/match.js');
var splash = require('./splash/splash.js');
var services = require('./services/services.js');
var auth = require('./auth/auth.js');
var profile = require('./profile/profile.js');

// Instantiate our app instance and add ngRoute as a dependecy via
// the 'angular-route' npm module. (ngRoute === angular-route)
angular.module('cinePlate', [require('angular-route'), require('angular-animate'), 'cinePlate.services', 'cinePlate.splash', 'cinePlate.match', 'cinePlate.auth', 'cinePlate.profile'])

// Angular routing -- Express handles serving the index.html file
// and we use Angular's $routeProvider via ngRoute to match urls
// with templates and their corresponding controllers.
.config(['$routeProvider', function($routeProvider) {
  $routeProvider

  // The /match route is where the results of a zip code
  // lookup are loaded.
    .when('/signin', {
    templateUrl: 'app/auth/signin.html',
    controller: 'AuthCtrl'
  })

  .when('/signup', {
    templateUrl: 'app/auth/signup.html',
    controller: 'AuthCtrl'
  })

  .when('/userProfile', {
    templateUrl: 'app/profile/userProfile.html',
    controller: 'ProfileCtrl'
  })

  .when('/error/500', {
    templateUrl: 'app/error/500.html'
  })

  .when('/error/404', {
    templateUrl: 'app/error/404.html'
  })

  .when('/:zip', {
    templateUrl: 'app/match/match.html',
    controller: 'MatchCtrl'
  })

  // Load up the splash page so user can enter their zip.
  .when('/', {
    templateUrl: 'app/splash/splash.html',
    controller: 'SplashCtrl'
  })

  // Finally, a catchall route in case the path was not found above.
  .otherwise({
    redirectTo: '/'
  });
}])
