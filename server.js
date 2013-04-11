var restify = require('restify');

function activate(req, res, next) {
  var test = {
    message: 'hello ' + req.params.name
  }
  res.contentType = 'json';
  res.send(thing);
  return next();
}

function home(req, res, next) {
  var message = 'Welcome to the robot webserver. To access the API visit the <a href="/action">action</a> page.';
  res.setHeader('Content-Type', 'text/html');
  res.send(message);
  return next();
}

function instruct(req, res, next) {
  var message = 'This is the robot API. Actions are accepted via the PUT method. Reponses are in JSON. Triggering a new locomotive action causes the last action to cease. Accepted actions are:';

  var actions = [
    'forward',
    'reverse',
    'left',
    'right',
    'pulse-right',
    'pulse-left',
    'pulse-forward',
    'pulse-reverse'
  ];
  var htmlMessage = message;
  htmlMessage += '<ul>';
  for (action in actions) {
    htmlMessage += '<li>' + actions[action] + '</li>';
  }
  htmlMessage += '</ul>';
  res.setHeader('Content-Type', 'text/html');
  res.send(htmlMessage);
  return next();
}

function send(req, res, next) {
  res.setHeader('Content-Type', 'application/json');
  res.send({message: 'PUTTING THE DATA'});
  res.end();
  console.log(req.body);
  return next();
}

var server = restify.createServer({
  formatters: {
    'text/html': function(req, res, body){
      if (body instanceof Error) {
        return 'FAIL!\n';
      }
      if (Buffer.isBuffer(body)) {
        return body;
      }
      return body;
    }
  }
});
server.use(restify.bodyParser({ mapParams: false }));

// Give instructions if they just do a get.
server.get('/', home);
server.get('/action', instruct);
server.head('/', instruct);
server.post('/action', function create(req, res, next) {
  res.setHeader('Content-Type', 'application/json');
  res.send(201, Math.random().toString(36).substr(3, 8));
  return next();
});
server.put('/action', send);

server.listen(8888, function() {
  console.log('%s listening at %s', server.name, server.url);
});
