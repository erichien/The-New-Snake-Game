let _assignCellColor = (cell, i, j) => {
  if ((i + j) % 2 == 0) {
    cell.style.backgroundColor = '#B7D65C';
    // cell.style.backgroundColor = '#B6D856';
  } else {
    cell.style.backgroundColor = '#AFCF55';
    // cell.style.backgroundColor = '#A1CB4A';
  }
};

let createBoard = grid => {
  for (i of Array(8).keys()) {
    for (j of Array(8).keys()) {
      let cell = document.createElement('DIV');
      let button = document.createElement('BUTTON');

      button.setAttribute('class', 'button');
      button.setAttribute('data-button-pos', `${i},${j}`);
      cell.setAttribute('class', 'cell');
      cell.setAttribute('data-cell-pos', `${i},${j}`);
      _assignCellColor(cell, i, j);

      cell.addEventListener('mouseenter', () => {
        event.currentTarget.querySelector('.button').style.display = 'flex';
      });
      cell.addEventListener('mouseleave', () => {
        event.currentTarget.querySelector('.button').style.display = 'none';
      });
      cell.addEventListener('click', () => {
        event.currentTarget.querySelector('.button').style.display = 'flex';
      });

      cell.appendChild(button);
      grid.appendChild(cell);
    }
  }
};

(() => {
  document.addEventListener('DOMContentLoaded', () => {
    let socket = io(); // websocket to the server
    let grid = document.querySelector('.grid');

    createBoard(grid);

    // game states
    let gameInPlay = false;

    // connect to server
    socket.on('syn', sendSynAck => {
      sendSynAck(true);
      socket.on('ack', () => {
        gameInPlay = true;
        console.log('gameInPlay:', true);
        // take care of markup
      });
    });

    socket.on('gameStatusUpdate');

    // let cells = document.querySelectorAll('[data-pos]');
    //
    // for (let cell of cells) {
    //   let pos = cell.dataset.pos.split(',').map(Number);
    //   let sum = pos.reduce((i, j) => i + j);
    //
    //   if (sum % 2 == 0) {
    //     cell.style.backgroundColor = '#B6D856';
    //   } else {
    //     cell.style.backgroundColor = '#A1CB4A';
    //   }
    // }
  });
})();
