var HTTPS = require('https');
var hi = require('cool-ascii-faces');
var fs = require('fs');
var client = require("./index");

var botID = process.env.BOT_ID;
var botName = process.env.BOT_NAME;
var help = "Hi,\n\nI'm xkcd. I'm here to make sure you guys get the newest xkcd comic." +
  "\n\nType '@xkcd help' for a list of commands:" +
  "\n1) @xkcd newest/latest/current - show the newest comic." +
  "\n2) @xkcd random - show a random comic." +
  "\n3) @xkcd [NUMBER] - show comic [NUMBER].";
var commandNotFound = "Sorry. Command not found. Please type '@xkcd help' for a list of commands";
var currentComicJsonUrl = "https://xkcd.com/info.0.json";
var comicNotFound = "Can't find that comic!!!";
var stop = "Stop feeding xkcd!";
var start = "Start feeding xkcd";
var fileName = './bin/values.json';
var data = fs.readFileSync(fileName);
var file = JSON.parse(data);
var fiveMin = 5 * 60 * 1000;
var tempCurrent = -1;

function respond() {
  var request = JSON.parse(this.req.chunks[0]),
    botRegexHi = new RegExp('^\@' + botName + ' hi$'),
    botRegexHelp = new RegExp('^\@' + botName + ' help$'),
    botRegexCurrent = new RegExp('^\@' + botName + ' current$'),
    botRegexLatest = new RegExp('^\@' + botName + ' latest$'),
    botRegexNewest = new RegExp('^\@' + botName + ' newest$'),
    botRegexRandom = new RegExp('^\@' + botName + ' random$'),
    botRegexData = new RegExp('^\@' + botName + ' data$'),
    botRegexNumber = new RegExp('^\@' + botName + ' \\d+$'),
    botRegexNotFound = new RegExp('^\@' + botName + '*'),
    botRegexStop = new RegExp('^\@' + botName + ' stop123$'),
    botRegexStart = new RegExp('^\@' + botName + ' start123$'),
    regexNumbers = new RegExp('\\d+');

  if (isStop()) {
    if (botRegexStart.test(request.text)) {
      saveStopToRedis(false);
      // file.stop = false;
      // updateJson();
      post(start);
    }
    return;
  }

  this.res.writeHead(200);
  if (request.text) {
    if (botRegexHi.test(request.text)) {
      post(hi());

    } else if (botRegexHelp.test(request.text)) {
      post(help);

    } else if (botRegexCurrent.test(request.text) || botRegexLatest.test(request.text) || botRegexNewest.test(request.text)) {
      postXkcd(currentComicJsonUrl);

    } else if (botRegexRandom.test(request.text)) {
      if (tempCurrent < 1)
        postXkcdRandom();
      else {
        var randomNumber = getRandomArbitrary(1, tempCurrent);
        postXkcd(getLinkForNumber(randomNumber));
      }

    } else if (botRegexNumber.test(request.text)) {
      var numbers = request.text.match(regexNumbers);
      var number = parseInt(numbers[0]);
      postXkcd(getLinkForNumber(number));

    } else if (botRegexStop.test(request.text)) {
      saveStopToRedis(true);
      // file.stop = true;
      // updateJson();
      post(stop);

    } else if (botRegexData.test(request.text)) {
      post(JSON.stringify(file));

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
    if (res.statusCode === 202) {
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

function postXkcd(link, save) {
  var request = require("request");
  var result = comicNotFound;
  var alt;

  request({
    url: link,
    json: true
  }, function (error, response, body) {

    if (!error && response.statusCode === 200) {
      result = body.img;
      alt = "#" + body.num + " " + body.title + ": " + body.alt;

      if (save && body.num != null)
        saveBodyToRedis(body);
    }
    post(result, alt);
  })
}

function postXkcdRandom() {
  var request = require("request");
  var result = 1800;

  request({
    url: currentComicJsonUrl,
    json: true
  }, function (error, response, body) {

    if (!error && response.statusCode === 200)
      result = body.num;

    tempCurrent = result;
    var randomNumber = getRandomArbitrary(1, tempCurrent);
    postXkcd(getLinkForNumber(randomNumber));
  })
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
  if (oldTimeStamp === null || currentTimeStamp - oldTimeStamp > fiveMin) {
    file.spamCheckInterval.timeStamp = currentTimeStamp;
    updateLocalJson();
    return false;
  }
  return true;
}

function updateLocalJson() {
  fs.writeFile(fileName, JSON.stringify(file), finished);
  function finished(err) {
    console.log('Error: ' + err);
    if (err)
      return console.log(err);
    else {
      console.log(JSON.stringify(file));
      console.log(fileName + ' updated');
    }
  }
}

function saveBodyToRedis(body) {
  client.set('month', body.month);
  client.set('num', body.num);
  client.set('year', body.year);
  client.set('alt', body.alt);
  client.set('img', body.img);
  client.set('title', body.title);
  client.set('day', body.day);
}

function saveStopToRedis(bool) {
  client.set('stop', bool);
}

function isStop() {
  var stopBool = client.get('stop');
  if (stopBool == null) {
    saveStopToRedis(false);
    stopBool = false;
  }
  console.log(stopBool);
  return stopBool;
}

exports.respond = respond;
exports.index = function (req, res) {
  // client.get("test", function (err, reply) {
  //   console.log(reply.toString());
  // });
};