var browserify = require('browserify-middleware');
var express = require('express');
var Path = require('path');
var pg = require('pg');
var routes = express.Router();
var sass = require('node-sass-endpoint');
var User = require('./users.js');
var sessions = require('./sessions.js');
var cookieParser = require('cookie-parser');
var combo = require('./combos.js');
var suggestions = require('./suggestions.js');
var yelp = require('../db/seed/addRestaurant_newZip.js');


// require('../db/seed/seedRestaurant.js');
require('../db/seed/seedMovie.js');

//this is delayed by 20 seconds to avoid maxing out the
//movieDB api's rate limit
setTimeout(function(){
  require('../db/seed/seedTv.js');
}, 20000);

//seeds trailers after 40 seconds. see above!
setTimeout(function(){
  require('../db/seed/seedTrailer.js');
}, 50000);


//
// Get Postgres rolling.
//
var pgConConfig = (process.env.NODE_ENV === 'production') ?  process.env.DATABASE_URL : {
  database: "cinemaplate_dev",
  host: "localhost",
  port: 5432
};

//
// Provide a browserified file at a specified path
//
routes.get('/app-bundle.js', browserify('./client/app/app.js'));
routes.get('/css/app-bundle.css', sass.serve('./client/scss/app.scss'));

routes.post('/signin', function(req, res, next){
  User.signin(req, res, next)
});

routes.post('/signup', function(req, res, next){
  User.signup(req, res, next)
});

routes.post('/saveWork', function(req, res, next){
  if (req.session){
    combo.saveWork(req, res)
  } else {
    res.status(401).send({Error: "User is not logged in"})
  }
});

routes.post('/saveRestaurant', function(req, res, next){
  if (req.session){
    combo.saveRestaurant(req, res)
  } else {
    res.status(401).send({Error: "User is not logged in"})
  }  
});

routes.post('/saveCombo', function(req, res, next){
  if (req.session){
    combo.saveCombo(req, res)
  } else {
    res.status(401).send({Error: "User is not logged in"})
  }
});

routes.get('/userCombos', function(req, res, next){
  if (req.session){
    combo.pullCombos(req, res)
  } else {
    res.status(401).send({Error: "User is not logged in"})
  }
});

routes.post('/alterUserInfo', function(req, res, next){
  if (req.session){
    User.editUser(req, res)
  } else {
    res.status(401).send({Error: "You do not have permission for this request"})
  }
  
})

routes.get('/signout', function(req, res, next){
    var sessionId = req.session.id
    console.log('inside signout ', sessionId)
    // delete module.exports.sessions[sessionId];
    sessions.deleteSession(sessionId, res)
})
//
// Match endpoint to match movie genres with cuisines
//

routes.get('/api/match/:zip', function(req, res) {
  var zip = req.params.zip;
  req.body.cuisine = '';
  req.body.genre = '';

  //query yelp with zip and add restaurants to db
  yelp.addRestaurants(zip)
    .then(function(resp){
      console.log("made it to then!!!")
         suggestions.getMovieSuggestion(req, res)
    })
});

routes.post('/api/match/:zip', function(req, res) {
  if (req.body.cycle === 'Restaurant') {
    suggestions.getOnlyRestaurants(req, res)
  }
  else if (req.body.type === 'TV') {
    if (req.body.cycle === 'TV') {
      suggestions.getOnlyTv(req, res)
    } else {
      suggestions.getTVSuggestions(req, res)
    }
  } else {
    if (req.body.cycle === 'Movie') {
      suggestions.getOnlyMovies(req, res)
    } else {
     suggestions.getMovieSuggestion(req, res)
   }
  }
});

//
// Static assets (html, etc.)
//
var assetFolder = Path.resolve(__dirname, '../client');
routes.use(express.static(assetFolder));

if (process.env.NODE_ENV !== 'test') {
  //
  // The Catch-all Route
  // This is for supporting browser history pushstate.
  // NOTE: Make sure this route is always LAST.
  //
  routes.get('/*', function(req, res){
    res.sendFile( assetFolder + '/index.html' );
  });

  //
  // We're in development or production mode;
  // create and run a real server.
  //
  var app = express();

  // Parse incoming request bodies as JSON
  app.use( require('body-parser').json() );

  app.use(cookieParser());

  app.use(function (req, res, next) {
    if (req.cookies.sessionId) {
      sessions.findSession(req.cookies.sessionId)
        .then(function(session) {
          req.session = session;
          next();
        });
    } else {
      // No session to fetch; just continue
      next();
    }
  })

  // Mount our main router
  app.use('/', routes);

  // Start the server!
  var port = process.env.PORT || 4000;
  app.listen(port);
  console.log("Listening on port", port);
}
else {
  // We're in test mode; make this file importable instead.
  module.exports = routes;
}