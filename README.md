# The New Snake Game

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

1. Player 1 plugs in Game Boy (Raspberry Pi) to power and turns it on.  
2. Player 1 selects whether or not to start game.  
3. Player 1 plays with joystick.  
4. Player 2 goes to game web page.  
5. Player 2 puts target in the game in the browser.     

### Control  

1. Joystick: change the moving direction of the snake  
2. Button: select from menu (new game, exit, etc.)  
3. Laptop: uses the mouse to select the positions of targets   


https://goo.gl/yWCmYw
