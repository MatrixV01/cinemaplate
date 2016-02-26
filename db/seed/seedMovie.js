var reddit = require('./helpers/redditHelp');
var movie = require('./helpers/movieHelp');
var pg = require('pg');

//
// Get PG config'd
//
// var pgConString = '';
var pgConConfig = {
  database: "cinemaplate_dev",
  host: "localhost",
  port: 5432
}
// if (process.env.NODE_ENV !== 'production') {
//   // If trying to connect to DB remotely (ie, dev environment)
//   // we need to add the ssl flag.
//   pgConString = process.env.DATABASE_URL + '?ssl=true';
// } else {
//   pgConString = process.env.DATABASE_URL;
// }
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

//
// START Movie insert
//
reddit.getMovies()
  .then(function(res){
    return movie.getMovieDB(res)
  })
  .then(function(movieData){
      console.log('I am the response, do with me as you will',movieData)
      console.log("Total Movies Returned: ", movieData)

      var k;
      for (k=0;k<movieData.length;k++){
        (function(){
          var movieTitle = movieData[k].title
          var movieSummary = movieData[k].summary
          var movieUrl = movieData[k].url
          var movieImageUrl = movieData[k].img
          var movieRating = movieData[k].rating
          var movieReleaseDate = movieData[k].releaseDate
          var movieGenresArray = movieData[k].genreArray
          var movieGenres = ''
          var movieApiId = movieData[k].id
          // console.log(movieGenresArray.length)
          if (movieGenresArray.length>0) {
            for (var g=0;g<movieGenresArray.length;g++){
              (function(){

              })(g)
              var thisGenreID = movieData[k].genreArray[g]
              // console.log("GENRE ID: ", thisGenreID)
              var sqlGetMovieGenre = 'SELECT genre_name FROM "genres" WHERE genre_moviedb_id=' + thisGenreID

              pgClient.query(sqlGetMovieGenre, function(err, result){
                if (err){
                  return console.log("Error getting movie genre", err);
                }
                else {
                  movieGenres += result.rows[0].genre_name
                  // console.log("INITIAL: ", movieGenres)
                }

                var resultGenres = movieGenres.slice(0,-2)

              runInsertMovieQuery()
              })
              
            
            }
          }

          var runInsertMovieQuery = function(){
            
            var sqlInsertMovie = 'INSERT INTO "movies" (movie_title, movie_summary, movie_url, movie_image_url, movie_rating, movie_release_date, movie_genres, movie_api_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING movie_id'
            
            pgClient.query(sqlInsertMovie, [movieTitle, movieSummary, movieUrl, movieImageUrl, movieRating, movieReleaseDate, movieGenres, movieApiId], function (err, result){
                if (err){
                  return console.log('error inserting movie', err);
                }
                else {

                  console.log("Adding movie >>>", movieTitle)
                  var newMovieID = result.rows[0].movie_id
                   newMovieID
                }
                  console.log("NEW MOVIE ID: ", newMovieID)
              })
          }
          // });
        })(k);
      }
      console.log(movieData)
      return;
  })