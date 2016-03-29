var pg = require('pg');
var yelp = require('../db/seed/addRestaurant_newZip.js')

var pgConConfig = (process.env.NODE_ENV === 'production') ? process.env.DATABASE_URL : {
  database: "cinemaplate_dev",
  host: "localhost",
  port: 5432
};


exports.getOnlyRestaurants = function(req, res) {
  var zip = req.params.zip;
  var slimZip = zip.slice(0, 3);
  var toReturn = {};
  var pgClient = new pg.Client(pgConConfig);

  if (req.body.cuisine.length > 0) {
    var cuisine = req.body.cuisine;
    var restaurantQuery = pgClient.query("SELECT * FROM restaurants WHERE restaurant_zip LIKE '" + slimZip + "%' AND restaurant_cuisines = $1 ORDER BY random() limit 1", [cuisine], function(err, result) {
      return result;
    });
    restaurantQuery.on('end', function(result) {
      toReturn.restaurant = result.rows[0];
      toReturn.movie = req.body.toKeep;
      res.send(toReturn)
    });
  } else {
    var restaurantQuery = pgClient.query("SELECT * FROM restaurants WHERE restaurant_zip LIKE '" + slimZip + "%' ORDER BY random() limit 1", function(err, result) {
      return result;
    })
    restaurantQuery.on('end', function(result) {
      console.log("Result in only restaurant ", result)
      toReturn.restaurant = result.rows[0];
      toReturn.movie = req.body.toKeep;
      res.send(toReturn)
    })
  }

  pgClient.on('drain', function() {
    pgClient.end();
  });
  pgClient.connect()
}

exports.getOnlyMovies = function(req, res) {
  var pgClient = new pg.Client(pgConConfig);
  var toReturn = {};
  if (req.body.genre.length > 0) {
    var genre = req.body.genre;
    var genreSelect = "SELECT * FROM movies WHERE movie_genres = $1 order by random() limit 1"
    var movieQuery = pgClient.query(genreSelect, [genre], function(err, result) {
      return result;
    });
    movieQuery.on('end', function(result) {
      toReturn.movie = result.rows[0];
      toReturn.restaurant = req.body.toKeep;
      res.send(toReturn)
    });
  } else {
    var movieQuery = pgClient.query("SELECT * FROM movies order by random() limit 1", function(err, result) {
      return result;
    });
    movieQuery.on('end', function(result) {
      toReturn.movie = result.rows[0];
      toReturn.restaurant = req.body.toKeep;
      res.send(toReturn)
    });
  }

  pgClient.on('drain', function() {
    pgClient.end();
  });

  pgClient.connect()
};

exports.getOnlyTv = function(req, res) {
  var pgClient = new pg.Client(pgConConfig);
  var toReturn = {};
  if (req.body.genre.length > 0) {
    var genre = req.body.genre;
    var genreSelect = "SELECT * FROM tv WHERE tv_genres = $1 order by random() limit 1"
    var tvQuery = pgClient.query(genreSelect, [genre], function(err, result) {
      return result;
    });
    tvQuery.on('end', function(result) {
      toReturn.movie = result.rows[0];
      toReturn.restaurant = req.body.toKeep;
      res.send(toReturn)
    });
  } else {
    var tvQuery = pgClient.query("SELECT * FROM tv order by random() limit 1", function(err, result) {
      return result;
    });
    tvQuery.on('end', function(result) {
      toReturn.movie = result.rows[0];
      toReturn.restaurant = req.body.toKeep;
      res.send(toReturn)
    });
  }

  pgClient.on('drain', function() {
    pgClient.end();
  });

  pgClient.connect()
}

exports.getMovieSuggestion = function(req, res) {
  var zip = req.params.zip;
  // Get first 3 zip digits for SQL "like" query.
  var slimZip = zip.slice(0, 3);

  var combinedResult = {};
  var pgClient = new pg.Client(pgConConfig);

  if (req.body.cuisine.length > 0) {
    var cuisine = req.body.cuisine;
    var restaurantQuery = pgClient.query("SELECT * FROM restaurants WHERE restaurant_zip LIKE '" + slimZip + "%' AND restaurant_cuisines = $1 ORDER BY random() limit 1", [cuisine], function(err, result) {
      return result;
    });
    restaurantQuery.on('end', function(result) {
      combinedResult.restaurant = result.rows[0];
    });
  } else {
    var restaurantQuery = pgClient.query("SELECT * FROM restaurants WHERE restaurant_zip LIKE '" + slimZip + "%' order by random() limit 1", function(err, result) {
      return result;
    });
    restaurantQuery.on('end', function(result) {
      combinedResult.restaurant = result.rows[0];
    });
  }


  if (req.body.genre.length > 0) {
    var genre = req.body.genre;
    var genreSelect = "SELECT * FROM movies WHERE movie_genres = $1 order by random() limit 1"
    var movieQuery = pgClient.query(genreSelect, [genre], function(err, result) {
      return result;
    });
    movieQuery.on('end', function(result) {
      combinedResult.movie = result.rows[0];
      res.send(combinedResult)
    });
  } else {
    var movieQuery = pgClient.query("SELECT * FROM movies order by random() limit 1", function(err, result) {
      return result;
    });
    movieQuery.on('end', function(result) {
      combinedResult.movie = result.rows[0];
      res.send(combinedResult)
    });
  }

  pgClient.on('drain', function() {
    pgClient.end();
  });

  pgClient.connect()
};

exports.getTVSuggestion = function(req, res) {
  var zip = req.params.zip;
  // Get first 3 zip digits for SQL "like" query.
  var slimZip = zip.slice(0, 3);

  var combinedResult = {};
  var pgClient = new pg.Client(pgConConfig);
  if (req.body.cuisine.length > 0) {
    var cuisine = req.body.cuisine;
    var restaurantQuery = pgClient.query("SELECT * FROM restaurants WHERE restaurant_zip LIKE '" + slimZip + "%' AND restaurant_cuisines = $1 ORDER BY random() limit 1", [cuisine], function(err, result) {
      return result;
    });
    restaurantQuery.on('end', function(result) {
      combinedResult.restaurant = result.rows[0];
    });
  } else {
    var restaurantQuery = pgClient.query("SELECT * FROM restaurants WHERE restaurant_zip LIKE '" + slimZip + "%' order by random() limit 1", function(err, result) {
      return result;
    });
    restaurantQuery.on('end', function(result) {
      combinedResult.restaurant = result.rows[0];
    });
  }

  if (req.body.genre.length > 0) {
    var genre = req.body.genre;
    var genreSelect = "SELECT * FROM tv WHERE tv_genres = $1 order by random() limit 1"
    var tvQuery = pgClient.query(genreSelect, [genre], function(err, result) {
      return result;
    });
    tvQuery.on('end', function(result) {
      combinedResult.movie = result.rows[0];
      res.send(combinedResult)
    });
  } else {
    var tvQuery = pgClient.query("SELECT * FROM tv order by random() limit 1", function(err, result) {
      return result;
    });
    tvQuery.on('end', function(result) {
      combinedResult.movie = result.rows[0];
      res.send(combinedResult)
    });
  }

  pgClient.on('drain', function() {
    pgClient.end();
  });

  pgClient.connect()
}
