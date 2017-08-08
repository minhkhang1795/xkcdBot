var http, director, cool, bot, router, server, port, client;

http = require('http');
director = require('director');
cool = require('cool-ascii-faces');
bot = require('./bot.js');
client = require('redis').createClient(process.env.REDIS_URL);

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

client.on('connect', function() {
    console.log('Redis connected');
});

module.exports = index;

function ping() {
  this.res.writeHead(200);
  this.res.end("xkcd bot by Minh-Khang Vu");
}