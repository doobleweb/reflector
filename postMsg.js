
var request = require('request');          // need inorder to make a get command inside post request

module.exports = {
postBack: function(postReflector){
    // Start the last request to post back to slack
    request(postReflector, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        return body;
      }
      else {
        console.log("error while posting back");
        return false;
      }
    });
  }
}
