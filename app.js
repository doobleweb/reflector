var express = require('express');          // express get and post
var request = require('request');          // need inorder to make a get command inside post request
var bodyParser = require('body-parser');   // need inorder to parse body in line 19
var he = require('./he');                  // supllies the function that will reflect the text
require('dotenv').config();                // required for .env file

var http = require('http');                // Needed modules for parsing HTML files that are in the public folder
var fs = require('fs');                    //

const storage = require('node-persist');   //storage module for saving the token outside the app
storage.init();

const app = express();

app.use(bodyParser.json());                         // support json encoded bodies
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
      res.writeHead(404); //page not fount
      res.write('File not found');
    } else {
      res.write(data);   //write back to front end
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
       res.redirect('/success');   //if success redirect to success.html page
     }
   })
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
//
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

// Reply to channel according to given word in the body
// if the user sent /reflect with following text the app will take that text and reflect it
// else if the user sent just /reflect without text the app will take the last message text and reflect it
const getReply = function (body){
  return new Promise(function (resolve, reject) {
    let data = {};
    getToken(body.team_id)
    .then((tokenRes) => {
      if(body.text)
      {
        return resolve(buildData('in_channel', 'Reflecting ' + body.text, he.decideLang(body.text)));
      }
      else
      { // no text entered
        getLastWord(tokenRes, body.channel_id, process.env.SLACK_API_CONVERSATION_HISTORY_URL)
        .then((lastWordRes) => {
          if (lastWordRes['subtype'] !== "bot_message"){  //check if last message was from reflector app
            data = buildData('in_channel', 'Reflecting ' + lastWordRes['text'], he.decideLang(lastWordRes['text']));
          } else {  //if last message was from the app return error
            data = buildData('in_channel', 'Reflector Error', 'Reflector cannot be used twice in a row');
           }
           return resolve(data);
         }).catch(console.error);
       }
     }).catch(console.error);
    });
  }

//build data that is sent back to slack channel
const buildData = function (type,text,attachText) {
  data = {
    response_type: type, // private message
    text: text,
    attachments:[{
      text: attachText
    }
  ]};
  return data;
  }

//get token function from the storage instance
const getToken = function(team){
  return new Promise(function(resolve, reject) {
    let oauthToken = storage.getItem(team);
    return resolve(oauthToken);
  });
}

//get user full real name for Reflector answer
const getUserFullData = function (token, username, uri) {
  return new Promise(function(resolve, reject) {
    var getUserData = {
           uri : uri,
           method : 'GET',
           qs : {
             'token' : token
           }
         }
    request(getUserData, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        for (var i=0;i<JSON.parse(body).members.length;i++)
          if (JSON.parse(body).members[i].name == username)
            return resolve(JSON.parse(body).members[i]);
       } else {
         return resolve('Unable to find the user with the user name ' + username);
       }
     });
  });
}

// get last word function from the channel
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


////////////////////////////////////////////////////////////////////////////////////////////////
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
  var id = req.body.team_id;
  res.redirect('/team/' + id);
});

//api call from postman try 2//
app.get('/user/:userID/:teamID/:username/:realName', function (req, res) {
  getToken(req.params.teamID)
  .then((tokenRes) => {
      res.send({
        'Real name': req.params.realName,
        'username' : req.params.username,
        'user ID'  : req.params.userID,
        'team ID': req.params.teamID,
        'Access token' : tokenRes
      });
  })
  .catch(console.error);
});

//post call to reflector with team id and username and get all user Data
app.post('/user.Data', function (req,res) {
  var id;
  getToken(req.body.team_id)
  .then((tokenRes) => {
    getUserFullData(tokenRes, req.body.username, process.env.SLACK_API_USERS_LIST_URL)
    .then((userRes) => {
      res.redirect('/user/' +  userRes.id +"/"+ userRes.team_id+"/"+ userRes.name+"/"+ userRes.real_name);
    }).catch(console.error);
  }).catch(console.error);
});
