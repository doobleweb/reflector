var express = require('express');          // express get and post
var request = require('request');          // need inorder to make a get command inside post request
var bodyParser = require('body-parser');   // need inorder to parse body in line 19
var he = require('./he');                  // supllies the function that will reflect the text

var http = require('http');
var fs = require('fs');

require('dotenv').config();
const storage = require('node-persist');
storage.init();

const app = express();

app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

//listen  port
app.listen(4321, function(){
  console.log('Server stated on port 4321');
});

//install slack app
app.get('/', function(req, res) {
  res.writeHead(200, {'Content-Type': 'text/html'});
  fs.readFile(__dirname + "/public/index.html",null,function (error, data) {
    if (error) {
      res.writeHead(404);
      res.write('File not found');
    } else {
      res.write(data);
    }
    res.end();
  });
});

// This route handles get request to a /oauth endpoint. We'll use this endpoint for handling the
// logic of the Slack oAuth process behind app.
app.get('/oauth', function(req, res) {

  if (!req.query.code) { // access denied
     console.log('Access denied');
     return;
   }

   var data = {
     form: {
     client_id: process.env.SLACK_CLIENT_ID,
     client_secret: process.env.SLACK_CLIENT_SECRET,
     code: req.query.code
   }
 };

   request.post(process.env.SLACK_API_OAUTH_ACCESS_URL, data, function (error, response, body) {
     if (!error && response.statusCode == 200) {
       // Get an auth token (and store the team_id / token)
       storage.setItem(JSON.parse(body).team_id, JSON.parse(body).access_token);
       res.sendStatus=200;
     }
   })
   res.redirect('/success');
 });

//success on installing slack app
app.get('/success', function(req, res){
  res.writeHead(200, {'Content-Type': 'text/html'});
  fs.readFile(__dirname + "/public/success.html",null,function (error, data) {
    if (error) {
      res.writeHead(404);
      res.write('File not found');
    } else {
      res.write(data);
    }
    res.end();
  });
});

//### post request  ###//
//
// the function will get the last massage in the channel that requested the reflaction
// c_id represents channel id, str represents the text from the last massage
// str can be one or more words that will be tranfered to decideLang function to decide which language to reflect
// after that the app will post back with api function
app.post('/slackReflector',function(req,res){
    if(req.body.token !== process.env.SLACK_VERIFICATION_TOKEN) {
      // the request is NOT coming from Slack!
      res.sendStatus(401);
      return;
    } else {
      getReply(req.body)
        .then((result) => {
          res.json(result);
        });
    }
});

const getToken = function(team){
  return  new Promise(function(resolve, reject) {
    let oauthToken = storage.getItem(team);
    return resolve(oauthToken);
  });
}

const getUserFullname = function (token, user, uri) {
  return new Promise(function(resolve, reject) {
    var getName = {
           uri : uri,
           method : 'GET',
           qs : {
             'token' : token,
             'user' :  user
           }
         }
    request(getName, function (error, response, body) {
      if (!error && response.statusCode == 200) {
         return resolve(JSON.parse(body).user.real_name);
       } else {
         return resolve('The user');
       }
     });
  });
}

const getLastWord = function(token,channel_id, uri) {
  return new Promise(function(resolve, reject) {
    var getLastWord = {
      uri : uri,//  get the last massage in the channel that requested the reflaction
      method: 'GET', // typechannel_idof method
      qs:   {
        'token':       token,
        'channel':     channel_id,
        'inclusive':   true,
        'limit':       1
      }
    }
    request(getLastWord, function(error,response,body){
      if (!error && response.statusCode == 200) {
        return resolve(JSON.parse(body).messages['0']);
      }
    });
  });
}

// Reply in JSON
const getReply = function (body){
  return new Promise(function (resolve, reject) {
    let data = {};
    if(body.text) {
      getToken(body.team_id)
      .then((tokenRes) => {
          getUserFullname(tokenRes, body.user_id, process.env.SLACK_API_USERS_INFO_URL)
            .then((userRes) => {
              var resObj =he.decideLang(body.text);  //reflect

              data = {
                response_type: 'in_channel', // public to the channle
                text: 'Reflecting ' + body.text,
                attachments:[{
                  text: resObj
                }]
              };
              return resolve(data);
            })
            .catch(console.error);
          })
        .catch(console.error);

    } else { // no query entered
      getToken(body.team_id)
        .then((tokenRes) => {
          getUserFullname(tokenRes, body.user_id, process.env.SLACK_API_USERS_INFO_URL)
            .then((userRes) => {
              getLastWord(tokenRes, body.channel_id, process.env.SLACK_API_CONVERSATION_HISTORY_URL)
               .then((lastWordRes) => {
                 if (lastWordRes['subtype'] !== "bot_message"){
                   var resObj =he.decideLang(lastWordRes['text']);  //reflect
                   data = {
                    response_type: 'in_channel', // private message
                    text: 'Reflecting ' + lastWordRes['text'],
                    attachments:[{
                      text: resObj
                    }
                  ]};
                } else {
                  data = {
                   response_type: 'in_channel', // private message
                   text: 'Reflector Error',
                   attachments:[{
                     text: 'Reflector cannot be used twice in a row'
                   }
                 ]};
                }
                return resolve(data);
               })
               .catch(console.error);
             })
             .catch(console.error);
           })
           .catch(console.error);
  }
  });
}

//api call from postman try
app.get('/team/:id', function (req, res) {
  getToken(req.params.id)
  .then((tokenRes) => {
      res.send({
        'team_id': req.params.id,
        'token': tokenRes
      });
  })
  .catch(console.error);
});

//post call to reflector with team id as a parameter and get in return the team token
app.post('/team/token', function (req,res) {
  console.log(req);
  var id = req.body.id;
  console.log(req.body);
  res.redirect('/team/' + id);
});
