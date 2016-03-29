var Promise = require('bluebird')
var Yelp = require('node-yelp')

var client = Yelp.createClient({
  oauth: {
    "consumer_key": process.env.YELP_CONSUMER_KEY,
    "consumer_secret": process.env.YELP_CONSUMER_SECRET,
    "token": process.env.YELP_TOKEN,
    "token_secret": process.env.YELP_TOKEN_SECRET
  }
});

var yelp = module.exports;

//yelp only returns 20 results at a time, offset is necessary to get the next 20
yelp.getFoodByZip = function(zipcode) {
  var zip = zipcode;

  var call1 = client.search({
    actionlinks: true,
    location: zip,
    offset: 0
  });

  var call2 = client.search({
    actionlinks: true,
    location: zip,
    offset: 20
  });

  var call3 = client.search({
    actionlinks: true,
    location: zip,
    offset: 40
  });

  var call4 = client.search({
    actionlinks: true,
    location: zip,
    offset: 60
  });

  var call5 = client.search({
    actionlinks: true,
    location: zip,
    offset: 80
  });

  var call6 = client.search({
    actionlinks: true,
    location: zip,
    offset: 100
  });

  var call7 = client.search({
    actionlinks: true,
    location: zip,
    offset: 120
  });

  var call8 = client.search({
    actionlinks: true,
    location: zip,
    offset: 140
  });

  var call9 = client.search({
    actionlinks: true,
    location: zip,
    offset: 160
  });

  var call10 = client.search({
    actionlinks: true,
    location: zip,
    offset: 180
  });


  var getFoodList = function() {
    return Promise.all([call1, call2, call3, call4, call5, call6, call7, call8, call9, call10])
      .then(function(res) {
        //yelp API is not searchable by eat24_url - instead we have to do multiple calls, then filter for presence of
        //eat24_url to determine delivery restaurants
        var eat24 = [];

        //iterate through the Promise.all array object
        for (var x = 0; x < 10; x++) {
          var callX = res[x].businesses.filter(function(y) {
            return y.eat24_url !== undefined;
          });

          eat24 = eat24.concat(callX);

        }

        return eat24;

      }).then(function(res) {
        //return promise back to index.js
        return res;
      })
      .catch(function(err) {
        console.log('Error in yelp.getFoodList:', err)
      })
  }

  //return promise to index.js
  return getFoodList();
}
