var HTTPS = require('https');
var hi = "If it falls below 20% full, my bag turns red and I start to panic.";//require('cool-ascii-faces');
var botID = process.env.BOT_ID;
var botName = process.env.BOT_NAME;
var help = "Hi,\n\nI'm xkcd. I'm here to make sure you guys get the newest xkcd comic." +
  "\n\nType '@xkcd help' for a list of commands:" +
  "\n1) @xkcd newest - show the newest comic." +
  "\n2) @xkcd random - show a random comic." +
  "\n3) @xkcd [NUMBER] - show comic [NUMBER].";
var commandNotFound = "Sorry. Command not found. Please type '@xkcd help' for a list of commands";
var currentComicJsonUrl = 'https://xkcd.com/info.0.json';
var fs = require('fs');
var fileName = './values.json';
var file = require(fileName);

function respond() {
  var request = JSON.parse(this.req.chunks[0]),
    botRegexHi = new RegExp('^\@' + botName + ' hi$'),
    botRegexHelp = new RegExp('^\@' + botName + ' help$'),
    botRegexCurrent = new RegExp('^\@' + botName + ' newest$'),
    botRegexRandom = new RegExp('^\@' + botName + ' random$');
    botRegexNumber = new RegExp('^\@' + botName + ' number$');

  this.res.writeHead(200);
  if (request.text) {
    if (botRegexHi.test(request.text)) {
      post(hi);
    } else if (botRegexHelp.test(request.text)) {
      post(help);
    } else if (botRegexCurrent.test(request.text)) {
      postXkcd(currentComicJsonUrl);
    } else if (botRegexRandom.test(request.text)) {
      var randomNumber = getRandomArbitrary(1, getCurrentNumber());
      postXkcd(getLinkForNumber(randomNumber));
    } else if (botRegexNumber.test(request.text)) {
      // postMessage(getLinkForNumber(number));
    } else {
      // Check spam
      // post(commandNotFound);
    }
  } else {
    console.log("don't care");
  }
  this.res.end();
}

function post(botResponse, alt) {
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
    res.setEncoding('utf8');
    if (res.statusCode == 202) {
      // Success
      // if (alt != null)
        // post(alt);
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

function postXkcd(link) {
  var request = require("request");
  var result = 'Can\'t find that comic!!!';
  var alt;
  request({
    url: link,
    json: true
  }, function (error, response, body) {

    if (!error && response.statusCode === 200) {
      console.log("alt " + typeof body.alt + "\n");
      console.log("img " + typeof body.img);
      result = body.img;
      alt = body.alt;
    }
    post(alt);
  })
}

function getCurrentNumber() {
  return file.current.num;
}

function getRandomArbitrary(min, max) {
  return Math.random() * (max + 1 - min) + min;
}

function getLinkForNumber(number) {
  return "https://xkcd.com/" + number + "/info.0.json";
}

exports.respond = respond;