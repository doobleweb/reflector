What is Reflector?
Reflector is an app to reflect a text from english to hebrew and vice versa.

preInstallations:
  modules:
    install Express module - npm install express
    install Request module - npm install Request
    install body-parser module - npm install body-parser

How to work with Reflector? the Reflector app has 2 main activities:

  1. The user can write a text or get a text that was written not in the intended language. Reflector will get the last text that was written, reflect it and will post it back to the channel.
  2. The user want to reflect something of his own. (reflect akuo will post back שלום).

Reflector can decide on its own which language to reflect to:
  if the user writes reflect and then a text in english it will reflect it to hebrew,
  The same goes for english.
  For a text that contains the two languages, Reflector will decide which language to reflect to according to the number of letters of each language.
  The language which has the larger number of letters, Reflector will reflect to the other language.


currently the app only supports Slack API

How to install on new slack?
  1. Go to https://api.slack.com/apps
  2. Create new app
  3. Give your app a name and select your Workspace
  4. Add Slash command to your app
  5. Command:           for instance /reflect.
  6. Request URI:       "address of your server that holds the app"/slackTranslate/
  7. Short Description: write your description of the app
  8. Click Save
  9. Add OAuth & Permissions:
  10. Copy the app token and paste it in config.json inside "Slack_API_Key".
  11. In scopes give the permission: channels:history, channels:read, chat:write:bot.


  API Section:
  /team/id
            the user can do a post msg to /team/id with his team id and get the token that curesponds with his TeamID in the db.
           url : ("server address")/team/id
           body: {"team_id" : "(your team id)"}

           the return message will be:
           {"team_id" : "(your team id)",
            "token"      : "(the team token)"}

          2. /userData
            the user can do a post msg to /userData with his team id and a username and get the data about this user if he exist
           url : ("server address")/userData
           body: {"team_id" : "(your team id)",
                       "username" : "(the user you want to find about)"}

           the return message will be:
           {"Real Name" : "(user real name)"
            "username"  :  "(user username)"
            "user id"        :  "(user userID)"
            "team id"       :  "(user teamID)",
            "token"          :  "(the team token)"}
