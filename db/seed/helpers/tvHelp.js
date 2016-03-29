var rp = require('request-promise');
var Promise = require('bluebird');
var tv = module.exports;

//Queries the movieDb for TV shows.
//Note - this will not return matches for MOVIES included in the reddit results - that is a separate endpoint
//handled in movieHelp.js. Non-matches are filtered out.
tv.getMovieDB_Tv = function(redditObj) {

  var anObject = {},
    allCalls = [],
    arr,
    len;

  //the below allows for quick object lookup to verify that movieDB result matches the actual title from the reddit scrape
  redditObj.forEach(function(obj) {
    anObject[obj.title] = obj.url;
  })

  //rate limit - moviedb only allows 40 calls every 10 seconds
  //TODO add setInterval for more calls - time won't matter as this will only be a 1x a week population of the DB
  arr = redditObj.slice(0, 40);
  len = arr.length;

  //build array for Promise.all
  //TODO - use bluebird's Promise.map instead (This won't make a difference for user experience, so it will remain TODO. - JW-legacy)
  for (var x = 0; x < len; x++) {
    var escaped = escape(arr[x].title);
    allCalls.push(rp('http://api.themoviedb.org/3/search/tv?query=' + escaped + '&api_key=' + process.env.MOVIEDB_TOKEN))
  }

  return Promise.all(allCalls)
    //broke these up for readability - feel free to merge if it makes more sense
    .then(function(res) {
      return res.filter(function(obj) {
        var show = JSON.parse(obj);
        //if no match, movieDB will return empty results array
        //anObject verifies that title is an exact match, since movieDB will match on any words
        //i.e. search for 'The Walking Dead' may return results including 'The Talking Dead: Making of The Walking Dead'
        return show.results.length !== 0 && anObject[show.results[0].name];
      })
    })
    .then(function(res) {
      //build the tvShow super object for SQL insertion
      return res.map(function(obj) {
        var show = JSON.parse(obj);
        var currShow = show.results[0];
        // console.log("this is currShow: ", currShow)
        return {
          title: currShow.name,
          summary: currShow.overview,
          url: anObject[currShow.name],
          img: 'https://image.tmdb.org/t/p/w185/' + currShow.poster_path,
          rating: Math.round(currShow.vote_average / 2),
          releaseDate: currShow.first_air_date,
          genreArray: currShow.genre_ids
        };
      })
    })

}
