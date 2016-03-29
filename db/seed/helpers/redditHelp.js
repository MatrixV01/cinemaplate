var rp = require('request-promise');

var reddit = module.exports;

reddit.getMovies = function() {
  //gets top 100 posts from the last 30 days - raw_json=1 format is necessary to avoid reddit API legacy junk
  return rp('https://www.reddit.com/r/netflixbestof/top.json?sort=top&t=month&limit=100&raw_json=1').then(function(res) {

    //reddit objects are uuuuuugly
    var datum = JSON.parse(res);

    var redditObject = datum.data.children.filter(function(post) {
      //get rid of self posts & non-US titles - only want links to FREEDOM titles
      return !post.data.is_self && post.data.title.match(/(US)/i) !== null;
    }).map(function(post) {
      //this is the object being returned, scrubbed title + scrubbed url
      return {
        title: post.data.title.match(/\](.*?)\(/)[1].trim(),
        url: post.data.url.replace('dvd', 'www')
      };
    })
    console.log(redditObject);
    return redditObject;
  })
}
