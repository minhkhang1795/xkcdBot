var HTTPS = require('https');
var hi = require('cool-ascii-faces');
var fs = require('fs');
var client = require('redis').createClient(process.env.REDIS_URL);

var botID = process.env.BOT_ID;
var botName = process.env.BOT_NAME;
var zoID = "46185459";

var help = "Hi,\n\nI'm xkcd. I'm here to make sure you guys get the newest xkcd comic." +
  "\n\nType '@xkcd help' for a list of commands:" +
  "\n1) @xkcd newest/latest/current - show the newest comic." +
  "\n2) @xkcd random - show a random comic." +
  "\n3) @xkcd [NUMBER] - show comic [NUMBER].";
var commandNotFound = "Sorry. Command not found. Please type '@xkcd help' for a list of commands";
var currentComicJsonUrl = "https://xkcd.com/info.0.json";
var stop = "Stop feeding xkcd!";
var start = "Start feeding xkcd";
var fiveMin = 0; //5 * 60 * 1000; // in milliseconds
var tempCurrent = -1;

// Regular Expression
var botRegexHi = new RegExp('^\@' + botName + ' hi$'),
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

var fileName = './bin/values.json';
var data = fs.readFileSync(fileName);
var file = JSON.parse(data);

function respond() {
  var request = JSON.parse(this.req.chunks[0]);
  this.res.writeHead(200);
  checkStop(function finished(isStop) {
    if (isStop !== null && isStop) {
      // Already stopped, check if message is to restart
      if (botRegexStart.test(request.text)) {
        saveStopToRedis(false);
        post(start);
      }
      return;
    }

    // If not stop
    if (request.text) {
      if (botRegexHi.test(request.text)) {
        post(hi(), null, request);

      } else if (botRegexHelp.test(request.text)) {
        post(help, null, request);

      } else if (botRegexCurrent.test(request.text) || botRegexLatest.test(request.text) || botRegexNewest.test(request.text)) {
        postXkcd(currentComicJsonUrl, true, null, request);

      } else if (botRegexRandom.test(request.text)) {
        if (tempCurrent < 1)
          postXkcdRandom();
        else {
          var randomNumber = getRandomArbitrary(1, tempCurrent);
          postXkcd(getLinkForNumber(randomNumber), false, null, request);
        }

      } else if (botRegexNumber.test(request.text)) {
        var numbers = request.text.match(regexNumbers);
        var number = parseInt(numbers[0]);
        postXkcd(getLinkForNumber(number), false, number, request);

      } else if (botRegexStop.test(request.text)) {
        saveStopToRedis(true);
        post(stop);

      } else if (botRegexNotFound.test(request.text)) {
        // Check spam
        if (!isSpam() && request.user_id !== zoID)
          post(commandNotFound, null, request);
      }
    } else {
      console.log("don't care");
    }
  });
  this.res.end();
}

function post(botResponse, alt, request) {
  var options, body, attachments;

  options = {
    hostname: 'api.groupme.com',
    path: '/v3/bots/post',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    }
  };

  attachments = [];
  if (request !== null) {
    if (request.user_id !== zoID || request.user_id === zoID && alt === null) {
      var temp = {
        "type": "mentions",
        "user_ids": [request.sender_id],
        "loci": [
          [0, request.name.length + 1]
        ]
      };
      botResponse = "@" + request.name + " " + botResponse;
      attachments.push(temp);
    }
  }

  body = {
    "bot_id": botID,
    "text": botResponse,
    "attachments": attachments
  };

  console.log('sending ' + botResponse + ' to ' + botID);
  var botReq = HTTPS.request(options, function (res) {
    if (res.statusCode === 202) {
      // Success
      if (alt != null)
        post(alt, null, request);
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

function postXkcd(link, save, num, callBackRequest) {
  var request = require("request");
  var result = comicNotFound(num);
  var alt;

  request({
    url: link,
    json: true
  }, function (error, response, body) {

    if (!error && response.statusCode === 200) {
      result = body.img;
      alt = "@Zo #" + body.num + " " + body.title + ": " + body.alt + " [" + body.month + "/" + body.day + "/" + body.year + "]";

      if (save) {
        console.log('here');
        saveBodyToRedis(body);
      }
    }
    post(result, alt, callBackRequest);
  })
}

function postXkcdRandom(callBackRequest) {
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
    postXkcd(getLinkForNumber(randomNumber), false, null, callBackRequest);
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

function checkStop(finished) {
  client.get('stop', function (err, reply) {
    console.log(reply);
    finished(reply === 'true');
  });
}

function saveBodyToRedis(body) {
  console.log('saveBodyToRedis()');
  client.set('month', body.month);
  client.set('num', body.num);
  client.set('year', body.year);
  client.set('alt', body.alt);
  client.set('img', body.img);
  client.set('title', body.title);
  client.set('day', body.day);
}

// Function just for testing
function resetRedis() {
  client.set('month', 'a');
  client.set('num', 'a');
  client.set('year', 'a');
  client.set('alt', 'a');
  client.set('img', 'a');
  client.set('title', 'a');
  client.set('day', 'a');
}

function saveStopToRedis(bool) {
  client.set('stop', bool);
}

function comicNotFound(num) {
  if (num === null)
    return "Can't find comic !!!";
  else
    return "Can't find comic #" + num + " !!!";
}

exports.respond = respond;
client.on('connect', function () {
  console.log('Redis connected');
});
