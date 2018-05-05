# The New Snake Game

## What You'll Need

* Arduino/Genuino Uno Board x1

* Analog 2-axis Joystick with Select Button x1

  (the model we used: https://www.adafruit.com/product/512)

* 74HC595 8-bit Shift Register x4

* ULN2803A Darlington Transistor Array x3

* 8x8 RGB LED matrix

  (the model we used: http://a.co/6zWQJjW)

* Lots of jumper wires of diff. length

* Raspberry Pi x1

* Computer with a web browser x1

* Internet connection

## Setup

First, connect the LED matrix and joystick to the Arduino Board.

We initially followed these tutorials:

Connecting LED matrix: https://youtu.be/8SXR32OAuxM

Connecting Joystick: http://42bots.com/tutorials/arduino-joystick-module-example/

After all the wiring is done, power up and ssh to the Raspberry Pi, and clone the repository on the Pi:

```
git clone https://github.com/virtuositeit/The-New-Snake-Game.git
```

In The-New-Snake-Game folder, install all dependencies with

```
cd The-New-Snake-Game

npm install
```

Connect the Arduino board to Raspberry Pi, then navigate to the folder RGBMatrixScrollingTextPWM to compile the code and upload to Arduino

```
cd RGBMatrixScrollingTextPWM

make upload
```

Go back to The-New-Snake-Game directory, and start the server

```
cd ..

node server.js
```

In the web browser, go to the address of the page hosted by the server on Raspberry Pi.

## How to Play

### Player on Arduino

Controls the snake, chases the food.

The person playing on the Arduino will see a realtime game view on the LED matrix, and control the direction of the green snake with the joystick to chase the food in red.

### Player on the Computer

Places foods, challenges the snake.

The person playing on the computer will see a realtime game view on the webpage, and can place the food (in red) anywhere on the board. Also, The snake is in an orange disguise in the browser.

### Rules

If the snake bumps into itself or the walls, the game is over.

### Starting the Game

Both the Arduino and the web client need to be connected to play. As soon as the player on Arduino presses the joystick, the game will start.

### Restarting the Game

The game can simply be restarted by refreshing the webpage on the browser.

## Verplank Diagram

### Idea

Multiplayer, multiplatform, online Game Boy Snake Game, which allows one player to control the game scene (put the target), while the other player to play the game in real time.

### Metaphor

One person controls the game scene, and the other person plays. Adds a new role to a traditional single player game.

### Model

Raspberry Pi contols the state of the game and send/recrive updates from the browser and Arduino.

### Display

Handheld game console (Pi + Arduino): Snake body will be one color, target is another color.  
Laptop: shows real time snake position, and allows the user to place next targets.

### Error

Traditional snake game only allows single player, and usually don't have a role that controls the game scene.

### Scenario

You love the game, and you wish you could play it with your friend (in a new way).

### Task

1.  Player 1 plugs in Game Boy (Raspberry Pi) to power and turns it on.
2.  Player 1 selects whether or not to start game.
3.  Player 1 plays with joystick.
4.  Player 2 goes to game web page.
5.  Player 2 puts target in the game in the browser.

### Control

1.  Joystick: change the moving direction of the snake
2.  Button: select from menu (new game, exit, etc.)
3.  Laptop: uses the mouse to select the positions of targets

https://goo.gl/yWCmYw
