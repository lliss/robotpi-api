/**
 * @file
 * Provide the control API for the Raspberry Pi robot.
 * Server listens on 8888 and works with PUT requests.
 * Instructions can be seen with a GET.
 */

var restify = require('restify');
var gpio = require("pi-gpio");

/**
 * Landing page to help users get information if they hit the server with GET.
 */
function home(req, res, next) {
  var message = 'Welcome to the robot webserver. To access the API visit the <a href="/action">action</a> page.';
  res.setHeader('Content-Type', 'text/html');
  res.send(message);
  return next();
}

/**
 * Give a list of useful instructions and docs on how to use the API.
 */
function instruct(req, res, next) {
  var message = 'This is the robot API. Actions are accepted via the PUT method. Reponses are in JSON. Triggering a new locomotive action causes the last action to cease. Accepted actions are:';

  var actions = [
    'forward',
    'reverse',
    'left',
    'right',
    'stop'
    //'pulse-right',
    //'pulse-left',
    //'pulse-forward',
    //'pulse-reverse'
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

/**
 * On successful put operation, send control string to the robot.
 */
function send(req, res, next) {
  res.setHeader('Content-Type', 'application/json');
  res.send({message: 'PUTTING THE DATA'});
  res.end();
  var fire = req.body.fire;
  console.log(fire);
  controlPi(fire);
  return next();
}

// Prepare the REST server.
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

/**
 * Set up routes.
 */
// Give instructions if they just do a get.
server.get('/', home);
server.get('/action', instruct);
server.head('/', instruct);

// Handle activations on PUT.
server.put('/action', send);

// API Server listens on 8888.
server.listen(8888, function() {
  console.log('%s listening at %s', server.name, server.url);
});

/**
 * Based on the requested action activate associated GPIO pins.
 *
 * @param string action
 *   The action to perform on the robot.
 */
function controlPi(action) {
  // These pin numbers are wrong since the GPIO library seems to be coded
  // against earlier Raspberry Pi models. I've translated my pins to what
  // they would be on the 'Model A'.
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

/**
 * Turn on or off a pin based on pin number and boolean value.
 *
 * @param int pin
 *   The pin number to activate or deactivate.
 * @param boolean on
 *   true to activate a pin, false to deactiave it.
 */
function pinControl(pin, on) {
  gpio.open(pin, "output", function(err) {    // Open pin for output
    gpio.write(pin, on, function() {          // Set pin on or off
      gpio.close(pin);                        // Close pin
    });
  });
}
