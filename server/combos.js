var pg = require('pg');
var Promise = require('bluebird');
var sessions = require('./sessions.js');
var user = require('./users.js')
var pgConConfig = (process.env.NODE_ENV === 'production') ? process.env.DATABASE_URL : {
  database: "cinemaplate_dev",
  host: "localhost",
  port: 5432
};


//works must have a flag that indicates whether the given work is a movie or a tv show
exports.saveWork = function(req, res) {
  var pgClient = new pg.Client(pgConConfig);
  var userId = req.session.user_id;
  //it seems like the front end is currently getting the entire row from the database
  // -- it should be no problem then to send it back over
  if (req.body.type === "TV") {
    var workId = req.body.work.tv_id;
    var sqlInsert = "INSERT INTO usercombos (user_id, tv_id) VALUES ($1, $2) RETURNING *"
  } else {
    var workId = req.body.work.movie_id;
    var sqlInsert = "INSERT INTO usercombos (user_id, movie_id) VALUES ($1, $2) RETURNING *"
  }

  var insertWork = pgClient.query(sqlInsert, [userId, workId], function(err, result) {
    if (err) {
      console.error("Error inserting movie/tvshow into usercombos ", err);
    } else {
      return result;
    }
  })

  insertWork.on('end', function(result) {
    res.status(201).send(result.rows);
  })

  pgClient.on('drain', function() {
    pgClient.end();
  });

  pgClient.connect()
};

exports.saveRestaurant = function(req, res) {
  var pgClient = new pg.Client(pgConConfig);
  var userId = req.session.user_id;
  var restaurantId = req.body.restaurant.restaurant_id;
  var sqlInsert = "INSERT INTO usercombos (user_id, restaurant_id) VALUES ($1, $2) RETURNING *"

  var insertRestaurant = pgClient.query(sqlInsert, [userId, restaurantId], function(err, result) {
    if (err) {
      console.error("Error inserting restaurant into usercombos ", err);
    } else {
      return result;
    }
  })

  insertRestaurant.on('end', function(result) {
    res.status(201).send(result.rows[0]);
  })
  pgClient.on('drain', function() {
    pgClient.end();
  });

  pgClient.connect()
};

//works must have a flag that indicates whether the given work is a movie or a tv show
exports.saveCombo = function(req, res) {
  var pgClient = new pg.Client(pgConConfig);
  var userId = req.session.user_id;
  var restaurantId = req.body.restaurant.restaurant_id;
  if (req.body.type === "tv") {
    var sqlInsert = "INSERT INTO usercombos (user_id, restaurant_id, tv_id) VALUES ($1, $2, $3) RETURNING *"
    var workId = req.body.work.tv_id;
  } else {
    var sqlInsert = "INSERT INTO usercombos (user_id, restaurant_id, movie_id) VALUES ($1, $2, $3) RETURNING *"
    var workId = req.body.work.movie_id
  }

  var insertCombo = pgClient.query(sqlInsert, [userId, restaurantId, workId], function(err, result) {
    if (err) {
      console.error('Error in inserting combo into usercombos ', err)
    } else {
      return result
    }
  })
  insertCombo.on('end', function(result) {
    res.status(201).send(result.rows[0]);
  })

  pgClient.on('drain', function() {
    pgClient.end();
  });

  pgClient.connect()
};

exports.pullCombos = function(req, res) {
  var pgClient = new pg.Client(pgConConfig);
  var userId = req.session.user_id;

  var userData = {};
  var selectInfo = "SELECT * FROM usercombos FULL OUTER JOIN movies ON movies.movie_id = usercombos.movie_id FULL OUTER JOIN tv ON tv.tv_id = usercombos.tv_id FULL OUTER JOIN restaurants ON restaurants.restaurant_id = usercombos.restaurant_id WHERE usercombos.user_id = $1"

  var findCombos = pgClient.query(selectInfo, [userId], function(err, result) {
    if (err) {
      console.error("There was an error fetching usercombos ", err)
    } else {
      return result
    }
  })

  findCombos.on('end', function(result) {
    userData.combos = result.rows
  })

  var selectUser = "SELECT username, location, email FROM users WHERE user_id = $1"
  var findUser = pgClient.query(selectUser, [userId], function(err, result) {
    if (err) {
      console.error("There was an error fetching this user ", err)
    } else {
      return result
    }
  })

  findUser.on('end', function(result) {
    userData.user = result.rows;
    res.status(200).send(userData);
  })

  pgClient.on('drain', function() {
    pgClient.end();
  });

  pgClient.connect()
}
