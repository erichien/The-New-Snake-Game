let express = require('express'); // web server application
let app = express(); // webapp
let http = require('http').Server(app); // connects http library to server
let io = require('socket.io')(http); // connect websocket library to server
let serialPort = require('serialport'); // serial library
let readLine = serialPort.parsers.Readline; // read serial data as lines
let serverPort = 8000;

//---------------------- WEBAPP SERVER SETUP ---------------------------------//
// use express to create the simple webapp
app.use(express.static('public')); // find pages in public directory

// start the server and say what port it is on
http.listen(serverPort, function() {
  console.log('listening on *:%s', serverPort);
});

app.get('/', function(req, res) {
  res.sendFile('./public/index.html');
});

//----------------------------------------------------------------------------//

//------------------------------- GAME STATES --------------------------------//
let clientReady = false;
let arduinoReady = false;
let gameInPlay = false;
let score = 0;
let foodPos = [0, 0]; // when food is eaten => null
let dir = 'right'; // random?
let snakeBody = [[3, 3], [3, 4], [3, 5]];
let snakeBodySet = new Set();
let gameStatus = {};

let _updateGameStatus = () => {
  gameStatus = {
    gameInPlay: gameInPlay,
    score: score,
    foodPos: foodPos,
    dir: dir,
    snakeBody: snakeBody,
    snakeBodySet: snakeBodySet
  };
};

//----------------------------------------------------------------------------//

//---------------------- SERIAL COMMUNICATION --------------------------------//
// start the serial port connection and read on newlines



const serial = new serialPort('/dev/ttyUSB0', {
  baudRate: 115200
});
const parser = new readLine({
  delimiter: '\r\n'
});

// TODO: calculate whether or not to change snake's moving direction: e.g. can't move opposite dir

// Read data that is available on the serial port and send it to the websocket
serial.pipe(parser);
parser.on('data', data => {
  // on data from the arduino
  if (data == 'up') {
    dir = 'up';
    io.emit('');
  } else if (data == 'down') {
    dir = 'down';
    io.emit('new-pos', transmitData);
  } else if (data == 'left') {
    dir = 'left';
  } else if (data == 'right') {
    dir = 'right';
  } else if (data == 'press') {
    if (!arduinoReady) {
      arduinoReady = true;
      // check clientReady
      if (clientReady) {
        gameInPlay = true;
        console.log('gameInPlay:', true);
        // TODO: send initial matrix to arduino and client
      }
    }
  }
});

//----------------------------------------------------------------------------//

// io.emit('gameUpdate', a);

//---------------------- WEBSOCKET COMMUNICATION -----------------------------//

io.on('connect', function(socket) {

  // call reset to make sure the website is clean
  socket.emit('reset');

  clientReady = true;
  console.log('connected to client');
  // serial.write('matrix', function(err) {
  //   if (err) {
  //     return console.log('Error on write: ', err.message);
  //   }
  //   console.log('message written');
  // });

  if (arduinoReady) {
    gameInPlay = true;
    console.log('gameInPlay:', true);
  }

  // can only listen for foodPlaced event via socket here
  // b.c. io is to many, socket is to one
  // => can't use io.on('foodPlaced', ...) outside io.on('connect', ...)
  // but can do io.emit('event', ...) outside io.on('connect', ...)
  socket.on('foodPlaced', pos => {
    console.log(pos);
    console.log(foodPos);
    foodPos = pos;
    console.log(foodPos);
    // foodPos = null;
    _updateGameStatus();
    io.emit('gameUpdate', gameStatus);
    console.log('food received:', foodPos);
    // take care of arduino
  });
  _updateGameStatus();
  io.emit('gameUpdate', gameStatus);
  /*
  // connect to client
  socket.emit('syn', synAck => {
    if (synAck) {
      io.emit('ack');
      clientReady = true;
      console.log('clientReady:', true);
      // check arduinoReady
      if (arduinoReady) {
        gameInPlay = true;
        console.log('gameInPlay:', true);
      }
    }
  });*/

  // if you get the 'disconnect' message, say the user disconnected
  io.on('disconnect', function() {
    // disconnect arduino
    console.log('disconnected from client');
  });
});
