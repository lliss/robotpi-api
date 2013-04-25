var restify = require('restify');
var gpio = require("pi-gpio");

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
  var fire = req.body.fire;
  console.log(fire);
  controlPi(fire);
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
server.put('/action', send);

server.listen(8888, function() {
  console.log('%s listening at %s', server.name, server.url);
});

function controlPi(action) {
  var dirPin1 = 12;
  var dirPin2 = 16;
  var stopPin = 18;

  switch (action) {
    case 'forward':
      pinControl(dirPin1, 0);
      pinControl(dirPin2, 0);
      pinControl(stopPin, 1);
      break;
    case 'reverse':
      pinControl(dirPin1, 1);
      pinControl(dirPin2, 1);
      pinControl(stopPin, 1);
      break;
    case 'left':
      pinControl(dirPin1, 0);
      pinControl(dirPin2, 1);
      pinControl(stopPin, 1);
      break;
    case 'right':
      pinControl(dirPin1, 1);
      pinControl(dirPin2, 0);
      pinControl(stopPin, 1);
      break;
    case 'stop':
    default:
      pinControl(stopPin, 0);
      break;
  }
}

function pinControl(pin, on) {
  gpio.open(pin, "output", function(err) {        // Open pin for output
    gpio.write(pin, on, function() {            // Set pin on or off
      gpio.close(pin);                        // Close pin
    });
  });
}
