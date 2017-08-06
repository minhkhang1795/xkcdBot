var HTTPS = require('https');
var hi = require('cool-ascii-faces');
var fs = require('fs');
var botID = process.env.BOT_ID;
var botName = process.env.BOT_NAME;
var help = "Hi,\n\nI'm xkcd. I'm here to make sure you guys get the newest xkcd comic." +
  "\n\nType '@xkcd help' for a list of commands:" +
  "\n1) @xkcd newest - show the newest comic." +
  "\n2) @xkcd random - show a random comic." +
  "\n3) @xkcd [NUMBER] - show comic [NUMBER].";
var commandNotFound = "Sorry. Command not found. Please type '@xkcd help' for a list of commands";
var currentComicJsonUrl = "https://xkcd.com/info.0.json";
var comicNotFound = "Can't find that comic!!!";
var fileName = './values.json';
var file = require(fileName);
var fiveMin = 10 * 1000;

function respond() {
  var request = JSON.parse(this.req.chunks[0]),
    botRegexHi = new RegExp('^\@' + botName + ' hi$'),
    botRegexHelp = new RegExp('^\@' + botName + ' help$'),
    botRegexCurrent = new RegExp('^\@' + botName + ' newest$'),
    botRegexRandom = new RegExp('^\@' + botName + ' random$'),
    botRegexNumber = new RegExp('^\@' + botName + ' \\d+$'),
    botRegexNotFound = new RegExp('^\@' + botName + '*'),
    regexNumbers = new RegExp('\\d+');

  this.res.writeHead(200);
  if (request.text) {
    if (botRegexHi.test(request.text)) {
      post(hi());

    } else if (botRegexHelp.test(request.text)) {
      post(help);

    } else if (botRegexCurrent.test(request.text)) {
      postXkcd(currentComicJsonUrl);

    } else if (botRegexRandom.test(request.text)) {
      var randomNumber = getRandomArbitrary(1, getCurrentNumber());
      postXkcd(getLinkForNumber(randomNumber));

    } else if (botRegexNumber.test(request.text)) {
      var numbers = request.text.match(regexNumbers);
      console.log(numbers);
      var number = parseInt(numbers[0]);
      if (number <= getCurrentNumber() && number > 0)
        postXkcd(getLinkForNumber(number));
      else
        post(comicNotFound);
    } else if (botRegexNotFound.test(request.text)) {
      // Check spam
      if (!isSpam())
        post(commandNotFound);
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
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    }
  };

  body = {
    "bot_id": botID,
    "text": botResponse
  };

  console.log('sending ' + botResponse + ' to ' + botID);
  var botReq = HTTPS.request(options, function (res) {
    if (res.statusCode == 202) {
      // Success
      if (alt != null)
        post(alt);
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
  var result = commandNotFound;
  var alt;
  request({
    url: link,
    json: true
  }, function (error, response, body) {

    if (!error && response.statusCode === 200) {
      result = body.img;
      alt = "#" + body.num + " " + body.title + ": " + body.alt;
    }
    post(result, alt);
  })
}

function getCurrentNumber() {
  return file.current.num;
}

function getRandomArbitrary(min, max) {
  return Math.floor(Math.random() * (max + 1 - min) + min);
}

function getLinkForNumber(number) {
  return "https://xkcd.com/" + number + "/info.0.json";
}

function isSpam() {
  var oldTimeStamp = file.spamCheckInterval.timeStamp;
  var currentTimeStamp = new Date().getTime();
  if (oldTimeStamp == null || currentTimeStamp - oldTimeStamp > fiveMin) {
    file.spamCheckInterval.timeStamp = currentTimeStamp;
    updateJson();
    return false;
  } else {
    return true;
  } 
}

function updateJson() {
  fs.writeFile(fileName, JSON.stringify(file), function (err) {
    if (err)
      return console.log(err);
    console.log(JSON.stringify(file));
    console.log(fileName + ' updated');
  });
}

exports.respond = respond;