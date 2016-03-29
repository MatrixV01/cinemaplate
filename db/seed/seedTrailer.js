var trailer = require('./helpers/trailerHelp.js')



exports.seedTrailers = function() {

  trailer.getIds()
    .then(function(ids) {
      ids.forEach(function(x) {
        trailer.getMovieDB_trailer(x)
          .then(function(trailerUrl) {
            trailer.storeTrailer(trailerUrl, x);
          })
      })
    })
}


exports.seedTrailers();
