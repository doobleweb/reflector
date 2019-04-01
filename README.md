What is Reflector?
Reflector is an app to reflect a text from english to hebrew and vice versa.

preInstallations:
  modules:
    install Express module - npm install express
    install Request module - npm install Request
    install body-parser module - npm install body-parser

how to work with Reflector? the Reflector app has 2 main activities:

  1. the user can write a text or get a text that was written not in the intended language. Reflector will get the last text that wa written, reflect it and will post it back to the channel.
  2. the user want to reflect something of his own. (reflect akuo will post back שלום).

Reflector can decide on its own which language to reflect to:
  if the user writes reflect and then a text in english it will reflect it to hebrew.
  the same goes for english.
  for a text that contains the two languages, Reflector will decide which language to reflect to according to the number of letters of each language.
  the language which has the larger number of letters, Reflector will reflect to the other language


currently the app only supports Slack API

how to install on new slack?
  1. go to https://api.slack.com/apps
  2. create new app
  3. Give your app a name and select your Workspace
  4. add Slash command to your app
  5. Command:           for instance /reflect.
  6. Request URI:       "address of your server that holds the app"/slackTranslate/
  7. Short Description: write your description of the app
  8. click Save
  9. add OAuth & Permissions:
  10. copy the app token and paste it in config.json inside "Slack_API_Key".
  11. in scopes give the permission: channels:history, channels:read, chat:write:bot
   
