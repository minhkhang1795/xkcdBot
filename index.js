var http, director, cool, bot, router, server, port, client;

http = require('http');
director = require('director');
cool = require('cool-ascii-faces');
bot = require('./bot.js');

router = new director.http.Router({
  '/': {
    post: bot.respond,
    get: ping
  }
});

server = http.createServer(function (req, res) {
  req.chunks = [];
  req.on('data', function (chunk) {
    req.chunks.push(chunk.toString());
  });

  router.dispatch(req, res, function (err) {
    res.writeHead(err.status, { "Content-Type": "text/plain" });
    res.end(err.message);
  });
});

port = Number(process.env.PORT || 5000);
server.listen(port);

// client = require('redis').createClient(process.env.REDIS_URL);

// client.on('connect', function() {
//     console.log('connected');
// });


var FeedParser = require('feedparser');
var request = require('request'); // for fetching the feed
var req = request('http://rss.cnn.com/rss/cnn_topstories.rss')
var feedparser = new FeedParser();

req.on('error', function (error) {
  // handle any request errors
});

req.on('response', function (res) {
  var stream = this; // `this` is `req`, which is a stream

  if (res.statusCode !== 200) {
    this.emit('error', new Error('Bad status code'));
  }
  else {
    stream.pipe(feedparser);
  }
});

feedparser.on('error', function (error) {
  // always handle errors
});

feedparser.on('readable', function () {
  // This is where the action is!
  var stream = this; // `this` is `feedparser`, which is a stream
  var meta = this.meta; // **NOTE** the "meta" is always available in the context of the feedparser instance
  var item;

  while (item = stream.read()) {
    console.log(item);
  }
});


function ping() {
  this.res.writeHead(200);
  this.res.end("Hey, I'm Cool Guy.");
}