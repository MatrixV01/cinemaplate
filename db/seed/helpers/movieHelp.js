var rp = require('request-promise');
var Promise = require('bluebird');
var movie = module.exports;

//I perform a title query in the movie db
//Note - this will not return matches for TV shows included in the reddit results - that is a separate endpoint
//Non-matches are filtered out.
movie.getMovieDB = function(redditObj) {

  var anObject = {},
    allCalls = [],
    arr,
    len;

  //the below allows for quick object lookup to verify that movieDB result matches the actual title from the reddit scrape
  var titlesArray = redditObj.forEach(function(obj) {
    anObject[obj.title] = obj.url;
  })

  //rate limit - moviedb only allows 40 calls every 10 seconds
  //TODO add setInterval for more calls - time won't matter as this will only be a 1x a week population of the DB
  arr = redditObj.slice(0, 40);
  len = arr.length;

  //build array for Promise.all
  //TODO - use bluebird's Promise.map instead
  for (var x = 0; x < len; x++) {
    var escaped = escape(arr[x].title);
    allCalls.push(rp('http://api.themoviedb.org/3/search/movie?query=' + escaped + '&api_key=' + process.env.MOVIEDB_TOKEN))
      // TODO change moviedb api to query for movie id instead of title query
      // allCalls.push(rp(''http://api.themoviedb.org/3/movie/' + currMovie.id + '?api_key=' + process.env.MOVIEDB_TOKEN + '&append_to_response=videos'))
      // example for Interstellar: 'http://api.themoviedb.org/3/movie/157336?api_key=52bc5e6536cc2a2bbe8cf52f7395ef0b&append_to_response=videos'

  }

  return Promise.all(allCalls)
    //broke these up for readability - feel free to merge if it makes more sense
    .then(function(res) {
      return res.filter(function(obj) {
        var movie = JSON.parse(obj);
        //if no match, movieDB will return empty results array
        //anObject verifies that title is an exact match, since movieDB will match on any words
        //i.e. search for 'Fight Club' will return results including 'Zombie Fight Club'
        return movie.results.length !== 0 && anObject[movie.results[0].title];
      })
    })
    .then(function(res) {
      //build the movie super object for SQL insertion
      return res.map(function(obj) {
        var movie = JSON.parse(obj);
        var currMovie = movie.results[0];
        //TODO: api call with currMovie.id to grab a trailer url, pack trailer url into MOVIE SUPER OBJECT as "trailer"
        return {
          title: currMovie.title,
          summary: currMovie.overview,
          url: anObject[currMovie.title],
          img: 'https://image.tmdb.org/t/p/w185/' + currMovie.poster_path,
          rating: Math.round(currMovie.vote_average / 2),
          releaseDate: currMovie.release_date,
          genreArray: currMovie.genre_ids,
          id: currMovie.id
        };
      })
    })

}
