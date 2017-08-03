var HTTPS = require('https');
var hi = require('cool-ascii-faces');
var help = 'Hi,\nI\'m xkcd. I\'m here to make sure you guys get the newest comic.\nType \'@xkcd help\' for a list of commands:';
var imgLink = 'https://imgs.xkcd.com/comics/bun_alert.png';

var currentComicJsonUrl = 'https://xkcd.com/info.0.json';
var botID = process.env.BOT_ID;
var botName = process.env.BOT_NAME;

function respond() {
  var request = JSON.parse(this.req.chunks[0]),
    botRegexSample = new RegExp('^\@' + botName + ' hi$');
  botRegexHelp = new RegExp('^\@' + botName + ' help$');
  botRegexCurrent = new RegExp('^\@' + botName + ' current$');

  if (request.text) {
    this.res.writeHead(200);
    if (botRegexSample.test(request.text)) {
      postMessageSample();
    } else if (botRegexHelp.test(request.text)) {
      postMessageHelp();
    } else if (botRegexCurrent.test(request.text)) {
      postMessageCurrent();
    }
    this.res.end();
  } else {
    console.log("don't care");
    this.res.writeHead(200);
    this.res.end();
  }
}

function postMessageCurrent() {
  var botResponse;

  botResponse = getImageLinkFromJson(currentComicJsonUrl);
  post(botResponse);
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

function getImageLinkFromJson(u) {
  var request = require("request");
  var result;
  request({
    url: u,
    json: true
  }, function (error, response, body) {

    if (!error && response.statusCode === 200) {
      result = response.img;
    } else {
      return 'Can\'t find that comic!\n' + response;
    }
  })
  if (result != null)
    return result;
  return 'Can\'t find that comic!!!';
}

exports.respond = respond;