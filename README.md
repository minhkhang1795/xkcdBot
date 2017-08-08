# xkcd Bot for GroupMe written in NodeJS

## Introduction

This project creates a bot that feeds xkcd comics to one specific GroupMe.

## Contents

  * [Quickly get our sample bot up and running in your groups](#deploy)
    * Deploy the code to heroku
    * Create a bot
    * Configure to your bot's credentials
  * [Make changes to the bot](#pull)
    * Pull the code down to your local machine
    * Bot Commands & Features

## Requirements:

  * GroupMe account
  * Heroku account
  * [Heroku Toolbelt](https://toolbelt.heroku.com/)

# Get your bot up and running<a name="deploy"></a>

## Deploy to Heroku:

Be sure to log into heroku, using your heroku credentials, then click the link below.

[![Deploy](https://www.herokucdn.com/deploy/button.png)](https://heroku.com/deploy)

You should be taken to a page that looks like this:

![Deploy to Heroku](http://i.groupme.com/837x662.png.36c63698644a4f61a9ff3d5af91caa5e)

Optionally, you can give your app a name, or instead leave
it blank and let Heroku name it for you (you can change it later).

![Success](https://i.groupme.com/959x932.png.85e7959a8a9a41c6b20f5f6b50aceecb)


## Next, create a GroupMe Bot:

Go to:
https://dev.groupme.com/session/new

Use your GroupMe credentials to log into the developer site.

![Log into dev.groupme.com](https://i.groupme.com/640x292.png.38c9e590383149c1a01424fc61cdce4e)

Once you have successfully logged in, go to https://dev.groupme.com/bots/new

![Create your new bot](http://i.groupme.com/567x373.png.242d18352d7742858cf9a263f597c5d9)

Fill out the form to create your new bot:

  * Select the group where you want the bot to live
  * Give your bot a name
  * Paste in the url to your newly deply heroku app
    * `http://your-app-name-here.herokuapp.com/`
  * (Optional) Give your bot an avatar by providing a url to an image
  * Click submit

## Find your Bot ID:<a name="get-bot-id"></a>

Go here to view all of your bots:
https://dev.groupme.com/bots

Click on the one you just created.

![Select your new bot](http://i.groupme.com/871x333.png.5a33ef2b6ab74ea59d5aaa5569aaaf23)

On your Bot's page, copy the Bot ID

![Copy your Bot ID](http://i.groupme.com/615x295.png.3256190e86ed4cd7ae6cf09899c1f9a8)

## Add your Bot ID to your Heroku app:

Go here to see all of your Heroku apps and select the one you just created before:

https://dashboard-next.heroku.com/apps

![Select your heroku app](http://i.groupme.com/920x722.png.46154d6b95f249539c594b129ddb7732)

On your app page, click settings in the top navigation:

![Go to your app's settings](http://i.groupme.com/722x127.png.27c0a2e83c524064bd41bb66df76d14c)

On your app's setting page, find the Config Vars section and click the Reveal Config Vars button:

![Reveal your environment variables](http://i.groupme.com/606x181.png.94d5157963bc419886e98e038e3195c3)

Then click edit:

![Edit your environment variables](http://i.groupme.com/796x212.png.b8979454fc4742c7bae688ac67262755)

Fill out the form to add an environment variable to your app:

  * In the "key" field type: BOT_ID
  * In the "value" field paste your Bot ID that you copied in the previous steps
  * Click the save button

![Add the Bot ID environment variable](http://i.groupme.com/784x148.png.5790498a7acd46b289aca2be43e9c84e)

## Now go test your bot!

Go to GroupMe and type *"@xkcd hi"* in the group where your bot lives to see it in action.

![Test your Bot](http://i.groupme.com/821x587.png.7bcf55bed1c64acab83fa2c2ad0b0862)

# Make it your own<a name="pull"></a>

## Pull the code to your local machine

Within terminal, change directory to the location where you would like the files to live, then run this command:

    $ heroku git:clone -a YOUR_APP_NAME_HERE

And then change directory into the new folder

    $ cd YOUR_APP_NAME_HERE

## After making changes, commit the code to heroku

    $ git add .
    $ git commit -m "Your Commit Message"
    $ git push heroku master

Then go and check your bot

# All done! Go play around and make the bot your own.

## Bot Commands & Features

  * @xkcd hi - show test message/greeting
  * @xkcd help - show a list of commands
  * @xkcd newest/lastest/current - show the newest comic 
  * @xkcd random - show a random comic
  * @xkcd [NUMBER] - show comic [NUMBER]
  * Beside the commands above, you can set up your bot to feed the newest comic to your group in Heroku Scheduler.

You can freely edit your bot in `bot.js` file.

## Note 
  * This README format follows the original [GroupMe Bot Tutorial](https://github.com/groupme/bot-tutorial-nodejs)
  * The project uses [Heroku Scheduler](https://elements.heroku.com/addons/scheduler) and [Heroku Redis](https://elements.heroku.com/addons/heroku-redis), which requires Credit Card Validation. Charges may apply if your usages exceed free/hobby limits.

## License

Copyright 2017 MINH-KHANG VU

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

