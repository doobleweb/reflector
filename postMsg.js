var he = require('./he');                  // supllies the function that will reflect the text
var request = require('request');          // need inorder to make a get command inside post request

module.exports = {
postBack: function(body,givenText,c_id,apiKey,uri){
    var recv = JSON.parse(body);  //parse as json
      if (!givenText){ //check if givenText is null
    var str = recv.messages['0']['text']; // text from conversation
    }
    else {
      var str = givenText;
    }
    var user = recv.messages['0']['username'];
    if (user != 'reflect' || str == givenText)
        {
          var resObj =he.decideLang(str);  //reflect
          // prepare post msg
          var postReflector = {
            uri : uri ,
            method: 'POST',
            qs:   {
              'token':      apiKey,
              'channel':    c_id,
              'text':       resObj
              }
            }
            // Start the last request to post back to slack
            request(postReflector, function (error, response, body) {
              if (!error && response.statusCode == 200) {
                return body;
              }
            });
        }
   else {
     console.log("Errpr while posting back");
     return false;
   }
 }
}
