var rp = require('request-promise');
var Promise = require('bluebird');
var trailer = module.exports;
var pg = require('pg');

var pgConConfig = {
  database: "cinemaplate_dev",
  host: "localhost",
  port: 5432
}

var pgClient = new pg.Client(pgConConfig);

pgClient.connect(function(err){
   if (err){
        return console.log('could not connect to postgres', err);
   }
})

//quick patch for closing postgres connection
setTimeout(function(){
  pgClient.end();
}, 20000)


//Trailers Backend - breakdown:
  //1) seed ids to db [done]
  //3) get ids from db [done]
  //2) for all ids:
      //a) query api (with id) for trailer [done]
      //b) store trailer url in db [done]

trailer.getIds = function(){
  //grab ids for all movies in our db
  return new Promise(function(resolve, reject){

    var ids = [];
    var sqlGetApiId = 'SELECT movie_api_id FROM "movies"'
    pgClient.query(sqlGetApiId, function(err, result){
      if (err){
        reject();
        return console.error("error getting movie ids: ", err);
      }
      else {
        //idObjects is an array of objects, which all look like this: {movie_api_id : '12345'}
        var idObjects = result.rows; 

        idObjects.forEach(function(x){
          var newId = parseInt(x['movie_api_id']);
          ids.push(newId);
        });
          resolve(ids);
      }
    })
  })
}

trailer.getMovieDB_trailer = function(movie_api_id){

  //query api
  return new Promise(function(resolve, reject){
    var uri = 'http://api.themoviedb.org/3/movie/'+movie_api_id+'?api_key='+process.env.MOVIEDB_TOKEN+'&append_to_response=videos'

    rp(uri)
    .then(function(res){
      var movie = JSON.parse(res);
      var trailerKey = movie.videos.results[0] || 'QrGrOK8oZG8'
      var trailerUrl = 'https://www.youtube.com/embed/'+ trailerKey;
      resolve(trailerUrl)
      
    })
    .catch(function(err){
      console.error('fuck. : ',err);
      reject(err);
    })
  })
}

trailer.storeTrailer = function(trailerUrl, movie_api_id){

  var updateTrailer = "UPDATE movies SET movie_trailer='" + trailerUrl + "' WHERE movie_api_id='" + movie_api_id.toString() + "'";
  var testTrailer = "UPDATE movies SET movie_trailer='I AM A URL' WHERE movie_api_id='308639'"

  pgClient.query(updateTrailer, function(err, result){
    if (err){
      console.error('Fuck. ', err);
      //reject(err)
    } else{
      console.log("a trailer has been added! ", result);
      //resolve();
    }
  })
}
