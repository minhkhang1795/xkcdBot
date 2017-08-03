var HTTPS = require('https');
var hi = require('cool-ascii-faces');
var help = 'Hi,\n I\'m xkcd. I\'m here to make sure to get the newest comic for you guys. \n Type @xkcd help for a list of command:'

var botID = process.env.BOT_ID;
var botName = process.env.BOT_NAME;

function respond() {
  var request = JSON.parse(this.req.chunks[0]),
    botRegexSample = new RegExp('^\@' + botName + ' hi$');
    botRegexHelp = new RegExp('^\@' + botName + ' help$');

  if (request.text) {
    this.res.writeHead(200);
    if (botRegexSample.test(request.text)) {
      postMessageSample();
    } else if (botRegexHelp.test(request.text)) {
      postMessageHelp();
    }
    this.res.end();
  } else {
    console.log("don't care");
    this.res.writeHead(200);
    this.res.end();
  }
}

function postMessageSample() {
  var botResponse, options, body;

  botResponse = hi();

  options = {
    hostname: 'api.groupme.com',
    path: '/v3/bots/post',
    method: 'POST'
  };

  body = {
    "bot_id": botID,
    "text": botResponse
  };

  console.log('sending ' + botResponse + ' to ' + botID);

  post(options, body);
}

function postMessageHelp() {
  var botResponse, options, body, botReq;

  botResponse = help();

  options = {
    hostname: 'api.groupme.com',
    path: '/v3/bots/post',
    method: 'POST'
  };

  body = {
    "bot_id": botID,
    "text": botResponse
  };

  console.log('sending ' + botResponse + ' to ' + botID);

  post(options, body);
}

function post(options, body) {
  var botReq = HTTPS.request(options, function (res) {
    if (res.statusCode == 202) {
      //neat
    } else {
      console.log('rejecting bad status code ' + res.statusCode);
    }
  });

  botReq.on('error', function (err) {
    console.log('error posting message ' + JSON.stringify(err));
  });
  botReq.on('timeout', function (err) {
    console.log('timeout posting message ' + JSON.stringify(err));
  });
  botReq.end(JSON.stringify(body));
}

exports.respond = respond;