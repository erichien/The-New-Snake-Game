(() => {
  document.addEventListener('DOMContentLoaded', () => {
    let socket = io(); // websocket to the server
    let grid = document.querySelector('.grid');

    _assignCellColor = (cell, i, j) => {
      if ((i + j) % 2 == 0) {
        cell.style.backgroundColor = '#B7D65C';
        // cell.style.backgroundColor = '#B6D856';
      } else {
        cell.style.backgroundColor = '#AFCF55';
        // cell.style.backgroundColor = '#A1CB4A';
      }
    };

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

    // socket.on('reset', function() { // on a 'reset' message clean and reste firstMessage
    //   firstMessage=true;
    //   ctx.clear();
    // });
    //
    // socket.on('new-pos', function(newPosition) { // handling new sensor values
    //
    //   //TODO: Map the incoming 10-bit numbers to the height and width of the screen.
    //   // See https://github.com/soulwire/sketch.js/wiki/API for sketch references
    //
    //   if(firstMessage){ // if its the first message store that value as previous
    //     firstMessage=false;
    //     previousPosition=newPosition;
    //   }else{ // any other message we use to draw.
    //     ctx.lineCap = 'round';
    //     ctx.lineJoin = 'round';
    //     ctx.fillStyle = ctx.strokeStyle = COLOUR;
    //     ctx.lineWidth = radius;
    //     ctx.beginPath();  //begin a adrawing
    //     ctx.moveTo( previousPosition[0], previousPosition[1] ); // from
    //     ctx.lineTo( newPosition[0],  newPosition[1]); // to
    //     ctx.stroke(); // and only draw a stroke
    //     previousPosition=newPosition; // update to the new position.
    //    }
    // });
  });
})();
