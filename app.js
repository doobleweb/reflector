var express = require('express');          // express get and post
var he = require('./he');                  // supllies the function that will reflect the text
var request = require('request');          // need inorder to make a get command inside post request
var bodyParser = require('body-parser');   // need inorder to parse body in line 19
var api = require('./config.json')         // json file to save APIs

const app = express();

app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

//### post request  ###//
//
// the function will get the last massage in the channel that requested the reflaction
// c_id represents channel id, str represents the text from the last massage
// str can be one or more words that will be tranfered to decideLang function to decide which language to reflect
// after that the app will post back with api function
app.post('/slackReflector',function(req,res){
  var c_id = req.body.channel_id; //get the channel id that requested  reflection
      //preapre get text msg
      var getLastWord = {
        uri : 'https://slack.com/api/conversations.history',
        method: 'GET',
        qs:   {
          'token':       api.Slack_API_Key,
          'channel':     c_id,
          'inclusive':   true,
          'limit':       1
          }
      }

      // Start the second request to get the last word or sentence
      request(getLastWord, function(error,response,body){
        var recv = JSON.parse(body);  //parse as json
        var str = recv.messages['0']['text']; // text from conversation
        var user = recv.messages['0']['username'];
        if (user != 'reflect')
            {
              var resObj =he.decideLang(str);
              // prepare post msg
              var postReflector = {
                uri : 'https://slack.com/api/chat.postMessage',
                method: 'POST',
                qs:   {
                  'token':      api.Slack_API_Key,
                  'channel':    c_id,
                  'text':       resObj,
                  'username' : 'reflect',
                  }
                }
                // Start the last request to post back to slack
                request(postReflector, function (error, response, body) {
                  if (!error && response.statusCode == 200) {
                    // Print out the response body
                  console.log(body)
                  res.send(response.status_code)
                  }
                });
            }
       else {
        res.end();
      }
  });
});

app.listen(3000, function(){
  console.log('Server stated on port 3000');
});
