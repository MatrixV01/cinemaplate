var reddit = require('./helpers/redditHelp');
var tv = require('./helpers/tvHelp');
var pg = require('pg');

//NOTE: this file needs testing.
//may need to be required somewhere, too.

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
// START tv show insert
//
reddit.getMovies()
  .then(function(res){
    return tv.getMovieDB_Tv(res)
  })
  .then(function(tvData){
      // console.log('I am the response, do with me as you will',tvData)

      var k;
      for (k=0;k<tvData.length;k++){
        (function(){
          var tvTitle = tvData[k].title
          var tvSummary = tvData[k].summary
          var tvUrl = tvData[k].url
          var tvImageUrl = tvData[k].img
          var tvRating = tvData[k].rating
          var tvReleaseDate = tvData[k].releaseDate
          var tvGenresArray = tvData[k].genreArray
          var tvGenres = ''
          // console.log(tvGenresArray.length)
          if (tvGenresArray.length>0) {
            for (var g=0;g<tvGenresArray.length;g++){
              (function(){

              })(g)
              var thisGenreID = tvData[k].genreArray[g]
              // console.log("GENRE ID: ", thisGenreID)
              var sqlGetMovieGenre = 'SELECT genre_name FROM "genres" WHERE genre_moviedb_id=' + thisGenreID

              pgClient.query(sqlGetMovieGenre, function(err, result){
                if (err){
                  return console.log("Error getting genre", err);
                }
                else {
                    if (!!result.rows[0]) {
                      tvGenres += result.rows[0].genre_name
                    }
                  // console.log("INITIAL: ", tvGenres)
                }

                var resultGenres = tvGenres.slice(0,-2)

              runInsertTvQuery()
              }) 
            
            }
          }

          var runInsertTvQuery = function(){
            
            var sqlInsertTv = 'INSERT INTO "tv" (tv_title, tv_summary, tv_url, tv_image_url, tv_rating, tv_release_date, tv_genres) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING tv_id'
            
            pgClient.query(sqlInsertTv, [tvTitle, tvSummary, tvUrl, tvImageUrl, tvRating, tvReleaseDate, tvGenres], function (err, result){
                if (err){
                  return console.log('error inserting tv show', err);
                }
                else {

                  console.log("Adding tv show >>>", tvTitle)
                  var newTvID = result.rows[0].tv_id
                }
                  console.log("NEW TV SHOW ID: ", newTvID)
              })
          }
          // });
        })(k);
      }
      // console.log('this is tvData: ', tvData);
      return;
  })
