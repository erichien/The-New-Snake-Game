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
let gameInPlay = false;
let score = 0;
let food = [0, 0];
let dir = null;
let snakeBody = [];

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
parser.on('data', function(data) {
  console.log(data);
  // on data from the arduino
  if (data == 'rst') {
    // if its the 'rst' string call reset
    //io.emit('reset');
  } else {
    // any other data we try to forward by spliting it
    // var transmitData = [data.split(',')[0], data.split(',')[1]];
    // io.emit('new-pos', transmitData);
  }
});

//----------------------------------------------------------------------------//

io.on('foodPlaced', () => {
  food = [0, 0];
});

//---------------------- WEBSOCKET COMMUNICATION -----------------------------//

io.on('connect', function(socket) {
  console.log('socket connected to client');
  serial.write('matrix', function(err) {
      if (err) {
        return console.log('Error on write: ', err.message);
      }
      console.log('message written');
    });

  // call reset to make sure the website is clean
  socket.emit('reset');

  // connect to client
  socket.emit('syn', synAck => {
    if (synAck) {
      socket.emit('ack');
      gameInPlay = true;
      console.log('gameInPlay:', true);
    }
  });

  // if you get the 'disconnect' message, say the user disconnected
  io.on('disconnect', function() {
    // disconnect arduino
    console.log('socket disconnected from client');
  });
});
