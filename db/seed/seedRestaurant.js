var pg = require('pg');
var yelp = require('./helpers/yelpHelp');

//
// Get PG config'd
//
var pgConString = '';
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

//
// START Restaurant insert
//
yelp.getFoodByZip(78749)
.then(function(res){
    // console.log('i am the res', res); 
    return res
})
.then(function(data){
    //loop through each restaurant and get restaurant details
    console.log("Total Restaurants Returned: ", data.length)
    console.log("Restaurant Object", data[0].location.city)
    var i;
    for (i =0;i<data.length;i++){
      (function(){

        var restName = data[i].name
        var restDescription = data[i].snippet_text
        var restPhone = data[i].display_phone
        var restStreetAddress = data[i].location.display_address[0]
        var restCity = data[i].location.city
        var restState = data[i].location.state_code
        var restZipCode = data[i].location.postal_code
        var restImageUrl = data[i].image_url
        var restEat24Url = data[i].eat24_url
        var restYelpRating = data[i].rating
        var restYelpId = data[i].id
        var restCuisinesLength = data[i].categories.length
        var restCuisines = ''
        // var newRestaurantID

        // push categories into temp array
        for (var j=0;j<restCuisinesLength;j++){
          restCuisines += (data[i].categories[j][0]) + ', '
        }

        console.log(i+1, ">>>", data[i].name)
        restCuisines = restCuisines.slice(0,-2)

        pgClient = new pg.Client(pgConConfig);
        pgClient.connect(function(err){
          if (err){
            return console.log('could not connect to postgres', err);
          }
          var sqlInsertRestaurants = 'INSERT INTO "restaurants" (restaurant_name,restaurant_description,restaurant_phone, restaurant_street_address, restaurant_city, restaurant_state, restaurant_zip, restaurant_image_url, restaurant_url, restaurant_yelp_rating, restaurant_yelp_id, restaurant_cuisines) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING restaurant_id'
          
          pgClient.query(sqlInsertRestaurants, [restName, restDescription, restPhone, restStreetAddress, restCity, restState, restZipCode, restImageUrl, restEat24Url, restYelpRating, restYelpId, restCuisines], function (err, result){
              if (err){                 
                return console.log('error inserting restaurant.', err.message);
              }
              else {
                if (result.rows[0].restaurant_id !== undefined){
                  var newRestaurantID = result.rows[0].restaurant_id
                  newRestaurantID
                }
                console.log("NEW RESTAURANT ID: ", newRestaurantID)
              }
            })
          });
      })(i);
    }
    return;
  })