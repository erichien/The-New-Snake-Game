let express = require('express'); // web server application
let app = express(); // webapp
let http = require('http').Server(app); // connects http library to server
let io = require('socket.io')(http); // connect websocket library to server
let serialPort = require('serialport'); // serial library
let readLine = serialPort.parsers.Readline; // read serial data as lines
let serverPort = 8000;


// start the serial port connection and read on newlines

const serial = new serialPort('/dev/ttyUSB0', {
  baudRate: 115200
});
const parser = new readLine({
  delimiter: '\r\n'
});

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
let snakeBody = [[3, 0], [3, 1], [3, 2]];
let snakeBodySet = new Set();

let _updateClient = () => {
  clientGameStatus = {
    gameInPlay: gameInPlay,
    snakeBody: snakeBody,
    foodPos: foodPos,
    score: score
  };
  io.emit('gameUpdate', clientGameStatus);
};

let _numsToString = pos => {
  return `${pos[0]},${pos[1]}`;
};

let _stringToNums = foodPosString => {
  return foodPosString.split(',').map(x => parseInt(x));
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
  newHead = [curI + dI, curJ + dJ];
  [i, j] = newHead;

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
    return -1; //?
  }

  if (foodPos && [i, j] == foodPos[0]) {
    score += 1;
    foodPos = null;
  } else {
    let tail = snakeBody.shift();
    snakeBodySet.delete(_numsToString(tail));
  }

  snakeBody.push(newHead);
  snakeBodySet.add(_numsToString(newHead));
};

let _gameLoop = () => {
  _calculateNextState();
  console.log(snakeBody);
  _updateClient(); // update client
  _updateArduino(); // update arduino
  console.log('Cant stop me now!');
};

//----------------------------------------------------------------------------//

//---------------------- SERIAL COMMUNICATION --------------------------------//
// TODO: calculate whether or not to change snake's moving direction: e.g. can't move opposite dir

// Read data that is available on the serial port and send it to the websocket

serial.pipe(parser);
parser.on('data', data => {
  // on data from the arduino
  if (data == 'up') {
    dir = 'U';
  } else if (data == 'down') {
    dir = 'D';
  } else if (data == 'left') {
    dir = 'L';
  } else if (data == 'right') {
    dir = 'R';
  } else if (data == 'press') {
    if (!arduinoReady) {
      arduinoReady = true;
      // check clientReady
      if (clientReady) {
        gameInPlay = true;
        console.log('gameInPlay:', true);

        // start game, 500 millisecs/frame
        setInterval(_gameLoop, 1000);

        //send initial matrix to arduino and client
        var stringTosend = 'matrix:' + snakeBody.toString();
        serial.write(stringTosend, function(err) {
          if (err) {
            return console.log('Error on write: ', err.message);
          }
          console.log('message written');
        });
      }
    }
  }
});

let _updateArduino=() => {

  // send game update to arduino
  var stringTosend = 'matrix:' + snakeBody.toString()
  if (foodPos) {
    stringTosend += ';foodPosition:' + foodPos.toString();
  }
  console.log(stringTosend);
  serial.write(stringTosend, function(err) {
    if (err) {
      return console.log('Error on write: ', err.message);
    }
    console.log('message written');
  });
}



//----------------------------------------------------------------------------//

//---------------------- WEBSOCKET COMMUNICATION -----------------------------//

io.on('connect', function(socket) {
  // call reset to make sure the website is clean
  socket.emit('reset');

  clientReady = true;
  console.log('connected to client');

  if (arduinoReady) {
    ////////////// change back to arduinoReady
    gameInPlay = true;
    console.log('gameInPlay:', true);

    // start game, 500 millisecs/frame
    setInterval(_gameLoop, 1000);
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
    _updateClient();
    io.emit('gameUpdate', gameStatus);
    console.log('food received:', foodPos);
  });
  // take care of arduino

  // if you get the 'disconnect' message, say the user disconnected
  io.on('disconnect', function() {
    // disconnect arduino
    console.log('disconnected from client');
  });
});

/*
class SnakeGame(object):

    def __init__(self, width, height, food):
        """
        Initialize your data structure here.
        @param width - screen width
        @param height - screen height
        @param food - A list of food positions
        E.g food = [[1,1], [1,0]] means the first food is positioned at [1,1], the second is at [1,0].
        :type width: int
        :type height: int
        :type food: List[List[int]]
        """
        self.snake_pos = set([(0, 0)])

    def move(self, direction):
        """
        Moves the snake.
        @param direction - 'U' = Up, 'L' = Left, 'R' = Right, 'D' = Down
        @return The game's score after the move. Return -1 if game over.
        Game over when snake crosses the screen boundary or bites its body.
        :type direction: str
        :rtype: int
        """

        # be careful!! the next pos if head could be where tail is now

        print direction
        cur_i, cur_j = cur_head = self.snake[-1]
        d_i, d_j = self.dirs[direction]
        new_head = cur_i + d_i, cur_j + d_j
        i, j = new_head

        if i < 0 or i == self.height or j < 0 or j == self.width or (new_head in self.snake_pos and new_head != self.snake[0]):
            return -1

        if self.food and [i, j] == self.food[0]:
            self.food.popleft()
        else:
            tail = self.snake.popleft()
            self.snake_pos.remove(tail)

        self.snake.append(new_head)
        self.snake_pos.add(new_head)

        return len(self.snake) - 1


# Your SnakeGame object will be instantiated and called as such:
# obj = SnakeGame(width, height, food)
# param_1 = obj.move(direction)
*/
