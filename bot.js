var HTTPS = require('https');
var hi = require('cool-ascii-faces');
var help = 'Hi,\nI\'m xkcd. I\'m here to make sure you guys get the newest comic.\nType \'@xkcd help\' for a list of commands:\n1) @xkcd newest: show newest comic.\nI\'m still dumb. I\'ll only send you an xkcd daily at a specific time.';
var imgLink = 'https://imgs.xkcd.com/comics/bun_alert.png';

var currentComicJsonUrl = 'https://xkcd.com/info.0.json';
var botID = process.env.BOT_ID;
var botName = process.env.BOT_NAME;

function respond() {
  var request = JSON.parse(this.req.chunks[0]),
    botRegexSample = new RegExp('^\@' + botName + ' hi$'),
    botRegexHelp = new RegExp('^\@' + botName + ' help$'),
    botRegexCurrent = new RegExp('^\@' + botName + ' newest$');

  this.res.writeHead(200);
  if (request.text) {
    if (botRegexSample.test(request.text)) {
      postMessageSample();
    } else if (botRegexHelp.test(request.text)) {
      postMessageHelp();
    } else if (botRegexCurrent.test(request.text)) {
      postMessageCurrent(currentComicJsonUrl);
    }
  } else {
    console.log("don't care");
  }
  this.res.end();
}

function postMessageSample() {
  var botResponse;

  botResponse = hi();
  post(botResponse);
}

function postMessageHelp() {
  var botResponse;

  botResponse = help;
  post(botResponse);
}

function post(botResponse) {
  var options, body;

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

function postMessageCurrent(u) {
  var request = require("request");
  var result = 'Can\'t find that comic!!!';
  request({
    url: u,
    json: true
  }, function (error, response, body) {

    if (!error && response.statusCode === 200) {
      console.log(body.img);
      result = body.img;
    }
    post(result);
  })
}

exports.respond = respond;