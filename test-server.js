let express = require('express'); // web server application
let app = express(); // webapp
let http = require('http').Server(app); // connects http library to server
let io = require('socket.io')(http); // connect websocket library to server
// let serialPort = require('serialport'); // serial library
// let readLine = serialPort.parsers.Readline; // read serial data as lines
let serverPort = 8000;

// start the serial port connection and read on newlines

// const serial = new serialPort('/dev/ttyUSB0', {
//   baudRate: 115200
// });
// const parser = new readLine({
//   delimiter: '\r\n'
// });

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

// game environment variables
let boardHeight = 8;
let boardWidth = 8;

let dirs = {
  U: [-1, 0],
  D: [1, 0],
  L: [0, -1],
  R: [0, 1]
};

// connections
let clientReady = false;
let arduinoReady = false;

// game state variables
let gameInPlay = false;
let score = 0;
let foodPos = null; // when food is eaten => null
let dir = 'R'; // 'U', 'D', 'L', 'R', randomize on start?
let initialPos = [[3, 0], [3, 1], [3, 2]];
let snakeBody = [];
let snakeBodySet = new Set();

let _startGame;

let _gameLoop = () => {
  _calculateNextState();
  console.log('snake at', snakeBody);
  _updateClient(); // update client
  // _updateArduino(); // update arduino
  console.log('Cant stop me now!');
};

let _numsToString = pos => {
  return `${pos[0]},${pos[1]}`;
};

let _resetStates = () => {
  score = 0;
  foodPos = null; // when food is eaten => null
  dir = 'R'; // 'U', 'D', 'L', 'R', randomize on start?
  snakeBody = initialPos.slice();
  console.log(snakeBody);
  snakeBodySet = new Set();
};

let _updateClient = () => {
  clientGameStatus = {
    gameInPlay: gameInPlay,
    snakeBody: snakeBody,
    foodPos: foodPos,
    score: score
  };
  io.emit('gameUpdate', clientGameStatus);
};

let _calculateNextState = () => {
  let curHead;
  let newHead;
  let curI;
  let curJ;
  let dI;
  let dJ;
  let i;
  let j;

  curHead = snakeBody[snakeBody.length - 1];
  [curI, curJ] = curHead;
  console.log(dir);
  [dI, dJ] = dirs[dir];
  [i, j] = [curI + dI, curJ + dJ];
  newHead = [i, j];

  // check if game over
  if (
    i < 0 ||
    i == boardHeight ||
    j < 0 ||
    j == boardWidth ||
    (snakeBodySet.has(_numsToString(newHead)) && newHead != snakeBody[0])
  ) {
    // game over
    gameInPlay = false;
    console.log('game over');

    clearInterval(_startGame);
    return;
  }

  if (foodPos && (foodPos[0] == newHead[0] && foodPos[1] == newHead[1])) {
    score += 1;
    foodPos = null;
  } else {
    let tail = snakeBody.shift();
    snakeBodySet.delete(_numsToString(tail));
  }

  snakeBody.push(newHead);
  snakeBodySet.add(_numsToString(newHead));
};

//----------------------------------------------------------------------------//

//---------------------- SERIAL COMMUNICATION --------------------------------//

// Read data that is available on the serial port and send it to the websocket

// serial.pipe(parser);
//
// parser.on('data', data => {
//   // on data from the arduino
//   if (data == 'up' && dir != 'U' && dir != 'D') {
//     dir = 'U';
//   } else if (data == 'down' && dir != 'D' && dir != 'U') {
//     dir = 'D';
//   } else if (data == 'left' && dir != 'L' && dir != 'R') {
//     dir = 'L';
//   } else if (data == 'right' && dir != 'R' && dir != 'L') {
//     dir = 'R';
//   } else if (data == 'press') {
//     if (!arduinoReady) {
//       arduinoReady = true;
//
//       // if clientReady, start game
//       if (clientReady) {
//         gameInPlay = true;
//         console.log('gameInPlay:', true);
//
//         _resetStates();
//         _initializeArduino();
//
//         // start game, 1000 millisecs/frame
//         _startGame = setInterval(_gameLoop, 1000);
//       }
//     }
//   }
// });
//
// let _initializeArduino = () => {
//   //send initial matrix to arduino and client
//   let stringTosend = 'matrix:' + snakeBody.toString();
//   serial.write(stringTosend, function(err) {
//     if (err) {
//       return console.log('Error on write: ', err.message);
//     }
//     console.log('message written');
//   });
// };
//
// let _updateArduino = () => {
//   // send game update to arduino
//   var stringTosend = 'matrix:' + snakeBody.toString();
//   if (foodPos) {
//     stringTosend += ';foodPosition:' + foodPos.toString();
//   }
//   //console.log(stringTosend);
//
//   serial.write(stringTosend, function(err) {
//     if (err) {
//       return console.log('Error on write: ', err.message);
//     }
//     console.log('message written');
//   });
// };

//----------------------------------------------------------------------------//

//---------------------- WEBSOCKET COMMUNICATION -----------------------------//

io.on('connect', function(socket) {
  // call reset to make sure the website is clean
  socket.emit('reset');
  clientReady = true;
  console.log('connected to client');

  if (clientReady) {
    _resetStates();
    gameInPlay = true;
    console.log('gameInPlay:', true);
    _startGame = setInterval(_gameLoop, 1000);
  }

  // can only listen for foodPlaced event via socket here
  // b.c. io is to many, socket is to one
  // => can't use io.on('foodPlaced', ...) outside io.on('connect', ...)
  // but can do io.emit('event', ...) outside io.on('connect', ...)
  socket.on('foodPlaced', pos => {
    foodPos = pos;
    console.log('food received:', foodPos);
  });

  // if you get the 'disconnect' message, say the user disconnected
  io.on('disconnect', function() {
    // disconnect arduino
    console.log('disconnected from client');
  });
});
