let _stringToNums = foodPosString => {
  return foodPosString.split(',').map(x => parseInt(x));
};

let _numsToString = pos => {
  return `${pos[0]},${pos[1]}`;
};

let _assignCellColor = (cell, i, j) => {
  if ((i + j) % 2 == 0) {
    cell.style.backgroundColor = '#B7D65C';
    // cell.style.backgroundColor = '#B6D856';
  } else {
    cell.style.backgroundColor = '#AFCF55';
    // cell.style.backgroundColor = '#A1CB4A';
  }
};

let _renderSnake = (grid, snakeBody) => {
  for (let pos of snakeBody) {
    let cell = grid.querySelector(
      `div[data-cell-pos=${'"' + _numsToString(pos) + '"'}]`
    );
    cell.querySelector('.button').style.display = 'flex';
  }
};

let _eraseSnake = (grid, snakeBody) => {
  for (let pos of snakeBody) {
    let cell = grid.querySelector(
      `div[data-cell-pos=${'"' + _numsToString(pos) + '"'}]`
    );
    cell.querySelector('.button').style.display = 'none';
  }
};

(() => {
  document.addEventListener('DOMContentLoaded', () => {
    let socket = io(); // websocket to server
    let grid = document.querySelector('.grid');

    // game states
    let gameInPlay = false;
    let snakeBody = null;
    let snakeBodySet = new Set();
    let score = 0;
    let foodPos = null;

    let _mouseenterHandler = event => {
      event.currentTarget.querySelector('.button').style.display = 'flex';
    };

    let _mouseleaveHandler = event => {
      event.currentTarget.querySelector('.button').style.display = 'none';
    };

    let _clickHandler = event => {
      _placeFood(event);
    };

    // how to pass socket and foodPos here?
    let _placeFood = event => {
      if (!foodPos) {
        foodPos = _stringToNums(event.currentTarget.dataset.cellPos);

        event.currentTarget.removeEventListener(
          'mouseenter',
          _mouseenterHandler
        );
        event.currentTarget.removeEventListener(
          'mouseleave',
          _mouseleaveHandler
        );
        event.currentTarget.removeEventListener('click', _clickHandler);
      }

      event.currentTarget.querySelector('.button').style.display = 'flex';
      socket.emit('foodPlaced', foodPos);
      console.log('food placed at', foodPos);
    };

    // _removeFood when food is eaten (state.foodPos = null)
    let _removeFood = stateFoodPos => {
      // take care of markup at foodPos
      let cell = grid.querySelector(
        `div[data-cell-pos=${'"' + _numsToString(foodPos) + '"'}]`
      );
      cell.addEventListener('mouseenter', _mouseenterHandler);
      cell.addEventListener('mouseleave', _mouseleaveHandler);
      cell.addEventListener('click', _clickHandler);

      cell.querySelector('.button').style.display = 'none';
      foodPos = null;
      console.log('food removed');
    };

    let _createBoard = (grid, socket, foodPos) => {
      for (i of Array(8).keys()) {
        for (j of Array(8).keys()) {
          let cell = document.createElement('DIV');
          let button = document.createElement('BUTTON');

          button.setAttribute('class', 'button');
          button.setAttribute('data-button-pos', `${i},${j}`);
          cell.setAttribute('class', 'cell');
          cell.setAttribute('data-cell-pos', `${i},${j}`);
          _assignCellColor(cell, i, j);

          cell.addEventListener('mouseenter', _mouseenterHandler);
          cell.addEventListener('mouseleave', _mouseleaveHandler);
          cell.addEventListener('click', _clickHandler);

          cell.appendChild(button);
          grid.appendChild(cell);
        }
      }
    };

    _createBoard(grid, socket, foodPos);

    socket.on('connect', () => {
      console.log('connected to server');
      // take care of markup
    });

    socket.on('gameUpdate', state => {
      console.log('gameUpdate state', state);

      _eraseSnake(grid, snakeBody);
      gameInPlay = state.gameInPlay;
      snakeBody = state.snakeBody;
      snakeBodySet = state.snakeBodySet;
      score = state.score;
      _renderSnake(grid, snakeBody);

      if (!state.foodPos) {
        _removeFood(foodPos);
      }
    });
  });
})();
