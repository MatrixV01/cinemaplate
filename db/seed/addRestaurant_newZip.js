var pg = require('pg');
var yelp = require('./helpers/yelpHelp');
var Promise = require('bluebird');

//pgconfig stuff
var pgConString = '';
var pgConConfig = {
  database: "cinemaplate_dev",
  host: "localhost",
  port: 5432
}

var pgClient = new pg.Client(pgConConfig);


exports.addRestaurants = function(zip){

  return new Promise(function(resolve, reject){
    yelp.getFoodByZip(zip)
      .then(function(data){
          console.log("Total Restaurants Returned: ", data.length)
          console.log("Restaurant Object", data[0].location.city)

          //allCalls will be populated with promises...
          var allCalls = [];
            
          var addOneRestaurant = function(x){

            return new Promise(function(res, rej){

              var restName = data[x].name
              var restDescription = data[x].snippet_text
              var restPhone = data[x].display_phone
              var restStreetAddress = data[x].location.display_address[0]
              var restCity = data[x].location.city
              var restState = data[x].location.state_code
              var restZipCode = data[x].location.postal_code
              var restImageUrl = data[x].image_url
              var restEat24Url = data[x].eat24_url
              var restYelpRating = data[x].rating
              var restYelpId = data[x].id
              var restCuisinesLength = data[x].categories.length
              var restCuisines = ''

              // push categories into temp array
              for (var j=0;j<restCuisinesLength;j++){
                restCuisines += (data[x].categories[j][0]) + ', '
              }

              console.log(x+1, ">>>", data[x].name)
              restCuisines = restCuisines.slice(0,-2)

              pgClient = new pg.Client(pgConConfig);
              pgClient.connect(function(err){
                if (err){
                  return console.log('could not connect to postgres', err);
                }
                var sqlInsertRestaurants = 'INSERT INTO "restaurants" (restaurant_name,restaurant_description,restaurant_phone, restaurant_street_address, restaurant_city, restaurant_state, restaurant_zip, restaurant_image_url, restaurant_url, restaurant_yelp_rating, restaurant_yelp_id, restaurant_cuisines) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING restaurant_id'
                
                var newRestaurants = pgClient.query(sqlInsertRestaurants, [restName, restDescription, restPhone, restStreetAddress, restCity, restState, restZipCode, restImageUrl, restEat24Url, restYelpRating, restYelpId, restCuisines], function (err, result){
                    if (err){ 
                      rej(err);  
                      console.error('error inserting restaurant.', err.message);          
                      return; 
                    }
                    else {
                      if (result.rows[0].restaurant_id !== undefined){
                        var newRestaurantID = result.rows[0].restaurant_id
                      }
                      console.log("NEW RESTAURANT ID: ", newRestaurantID)
                    }
                  })
                    newRestaurants.on('end', function(result){
                      console.log('a new restauarant called .on("end") here >> ', result);
                      res();
                      return result;
                    });
                    newRestaurants.on('error', function(err){
                      console.log('restaurant query error: ', err);
                      rej();
                      return err;
                    })
                  });
              });
            }

          //Calls addOneRestaurant for a bunch of restaurants
          for (var i =0;i<data.length;i++){
            allCalls.push(addOneRestaurant(i));
          }

          return Promise.all(allCalls)
              .then(function(res){
                console.log('all restaurants added to db! >>>')
                resolve(res);
              })

              .catch(function(err){
                console.error('error with allCalls: ', err);
                resolve(err); //should technically be reject
              })
    })
    .catch(function(err){
      console.error("ERROR: Yelp had problems. ", err);
      resolve(); //should technically be reject
    })
  })
}
