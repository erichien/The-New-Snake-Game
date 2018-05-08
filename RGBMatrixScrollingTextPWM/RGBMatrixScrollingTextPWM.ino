/*
 *  Adapted from https://youtu.be/8SXR32OAuxM
 */

#include <avr/pgmspace.h> // Library for storing data in program memory instead of SRAM.

#define __latchBit 4      // Constants used to directly manipulate the ports used for serial communication with the latches via the shiftOutFast subroutine
#define __dataBit 3
#define __clockBit 5
#define __shiftPORT PORTD

const uint32_t font[192] PROGMEM = { // This array contains the individual bitmaps for the 96 characters that can be displayed on the 8x8 matrix.  
                                     // Note that they are stored in the Arduino's program memory space rather than SRAM to conserve as much of the 2K of SRAM as possible
                                     // Each character is stored in 2 32 bit unsigned integers (pgmspace.h doesn't have a means of storing a single unsigned 64 bit integer)
  0x00000000, 0x00000000,    //
  0x00000000, 0x2F000000,    // !
  0x00000300, 0x03000000,    // "
  0x00143E14, 0x3E140000,    // #
  0x0000242A, 0x7F2A1200,    // $
  0x0205150A, 0x142A2810,    // %
  0x00001629, 0x29111028,    // &
  0x00000000, 0x03000000,    // '
  0x00000C12, 0x21000000,    // (
  0x00000021, 0x120C0000,    // )
  0x0000150E, 0x1F0E1500,    // *
  0x00000808, 0x3E080800,    // +
  0x00000040, 0x20000000,    // ,
  0x00000808, 0x08080000,    // -
  0x00000000, 0x20000000,    // .
  0x00201008, 0x04020100,    // /
  0x000C1221, 0x21120C00,    // 0
  0x00000022, 0x3F200000,    // 1
  0x00223129, 0x29252200,    // 2
  0x00122129, 0x29251200,    // 3
  0x00181412, 0x3F100000,    // 4
  0x00172525, 0x25251900,    // 5
  0x001E2525, 0x25251800,    // 6
  0x00211109, 0x05030100,    // 7
  0x001A2525, 0x25251A00,    // 8
  0x00062929, 0x29291E00,    // 9
  0x00000000, 0x24000000,    // :
  0x00000040, 0x24000000,    // ;
  0x00080814, 0x14222200,    // <
  0x00141414, 0x14141400,    // =
  0x00222214, 0x14080800,    // >
  0x00020129, 0x09060000,    // ?
  0x182442BA, 0xAABE0000,    // @
  0x00300C0B, 0x0B0C3000,    // A
  0x003F2525, 0x251A0000,    // B
  0x0C122121, 0x21120000,    // C
  0x003F2121, 0x211E0000,    // D
  0x003F2525, 0x25210000,    // E
  0x003F0505, 0x05010000,    // F
  0x0C122129, 0x291A0000,    // G
  0x003F0404, 0x04043F00,    // H
  0x00002121, 0x3F212100,    // I
  0x00102021, 0x211F0000,    // J
  0x003F080C, 0x12210000,    // K
  0x003F2020, 0x20202000,    // L
  0x003F0204, 0x0804023F,    // M
  0x003F0204, 0x08103F00,    // N
  0x00001E21, 0x21211E00,    // O
  0x003F0505, 0x05020000,    // P
  0x00001E21, 0x21215E00,    // Q
  0x003F050D, 0x15220000,    // R
  0x00001225, 0x29291200,    // S
  0x00010101, 0x3F010101,    // T
  0x001F2020, 0x20201F00,    // U
  0x01061820, 0x20180601,    // V
  0x003F1008, 0x0408103F,    // W
  0x0021120C, 0x0C122100,    // X
  0x00010204, 0x38040201,    // Y
  0x00213129, 0x25232100,    // Z
  0x00003F21, 0x21000000,    // [
  0x00010204, 0x08102000,    // \
  0x00002121, 0x3F000000,    // ]
  0x00000201, 0x02000000,    // ^
  0x00202020, 0x20202000,    // _
  0x00000001, 0x02000000,    // `
  0x00102A2A, 0x2A1A3C00,    // a
  0x003F1424, 0x24241800,    // b
  0x00001824, 0x24240000,    // c
  0x00182424, 0x24143F00,    // d
  0x001C2A2A, 0x2A2A0C00,    // e
  0x0000083E, 0x0A000000,    // f
  0x0018A4A4, 0x887C0000,    // g
  0x00003F04, 0x04380000,    // h
  0x00000000, 0x3D000000,    // i
  0x00808084, 0x7D000000,    // j
  0x00003F10, 0x28240000,    // k
  0x0000003F, 0x20000000,    // l
  0x003C0408, 0x08043C00,    // m
  0x00003C08, 0x04043C00,    // n
  0x00182424, 0x24241800,    // o
  0x00FC2824, 0x24241800,    // p
  0x00182424, 0x2428FC00,    // q
  0x0000242A, 0x2A120000,    // r
  0x00003C08, 0x04040800,    // s
  0x0000043E, 0x24040000,    // t
  0x00001C20, 0x20103C00,    // u
  0x000C1020, 0x20100C00,    // v
  0x0C302010, 0x1020300C,    // w
  0x00242810, 0x10282400,    // x
  0x00848850, 0x20100C00,    // y
  0x00002434, 0x2C240000,    // z
  0x00000C3F, 0x21210000,    // {
  0x00000000, 0x7F000000,    // |
  0x00002121, 0x3F0C0000,    // }
  0x00100808, 0x10100800,    // ~
  0x003F3F3F, 0x3F3F3F00     // 
};

byte screen[1024];     // Array for storing up to 1024 columns of bitmapped characters; roughly 128 characters

uint64_t longLong = 0; // 64 bit unsigned integer used for storing a individual character out of the font array

int dataPin = 3;       // Serial communication pin declarations
int latchPin = 4;
int clockPin = 5;

int levelPin = 10;     // Pin 10 is used to manipulate the brightness an individual pixel of each of the three colors

byte R[8][8];          // Arrays for storing the 8x8 matrix currently being displayed (one for each color)
byte G[8][8];
byte B[8][8];

int r = 8;            // Default brighness for each of the three colors; used when the program is set to cycle the text through the colors 
int g = 0;
int b = 0;

byte ledpx = 0;        // Bytes used to store the X and Y of the pixel being set by the updateShiftRegisters subroutine
byte ledpy = 0;

#define scrollSpeed 120 // Speed of the scrolling text is conrolled with this constant

boolean gameInPlay = false;
String displayString = "PRESS!";  // String to be displayed
int ascii = 0;                     // Variable used to index the font array
int arrayLength = 7;               // Bitmapped data starts being stored in the 8th element of the screen[] array to allow empty space to scroll by at the beginning of the message
byte byteRead = 0;                 // Variable used to grab an individual column of bitmapped data from the font array


// JOYSTICK CONSTANTS
const int X_PIN = A4;
const int Y_PIN = A5;
const int BUTTON_PIN = 2;
//const int LED_PIN = 13;
const unsigned long DEBOUNCE_DELAY = 120;  // microseconds
const int X_ORIGIN = 520;
const int Y_ORIGIN = 526;
const int CHANGE_THRESHOLD = 100;  // defines sensitivity to changing x and y's direction

int xDir = 0;
int yDir = 0;
int xValue = X_ORIGIN; // 0 to 1024
int yValue = Y_ORIGIN;
// byte curButtonState = HIGH;  // since pull-up resistor is used, assume switch open, initial pin value HIGH
// byte oldButtonState = HIGH;
byte buttonState = HIGH;
volatile boolean buttonPressed = false;
// bool xDirChanged = false;
// bool yDirChanged = false;
// bool buttonStateChanged = false;
unsigned long lastReadTime = 0;  // when the button last changed state
String command; // command from the Pi server
char character; 
int foodX;
int foodY;

void press() {
  buttonPressed = true;
}

void shiftOutFast(byte val)  // This subroutine replaces the incredibly slow "shiftOut" function.  Individual pixel data has to be sent once for each color and the shiftOut 
{                            // function just isn't fast enough to make it scroll smoothly.  This function directly manipulates the ports on the ATmega328.
  int u;
  for (u = 0; u < 8; u++)  {
    bitWrite(__shiftPORT, __dataBit, !!(val & (1 << u)));
    bitSet(__shiftPORT, __clockBit);
    bitClear(__shiftPORT, __clockBit);
  }
}

void updateShiftRegisters()
{
  for (int x = 0; x < 8; x++) {               // Loops through the 8x8 array to be displayed, turning on each bit individually at the specified brighness, once for each color
    if (buttonPressed) {
        break;                                                
      }
    for (int y = 0; y < 8; y++) {
      ledpx = 1 << x;
      ledpy = 1 << y;
      if (buttonPressed) {
        break;                                                
      }
      if (R[x][y]) {                          // If the Red bit is on, display it at the brighness specified, otherwise delay for about half the time it would have taken to 
        bitClear(PORTD, __latchBit);          // display it (this keeps the scrolling message from speeding up when displaying the empty spaces between each letter)
        shiftOutFast(0);
        shiftOutFast(0);
        shiftOutFast(ledpy);
        analogWrite(levelPin, 255 - R[x][y]);
        shiftOutFast(ledpx);
        bitSet(PORTD, __latchBit);
        delayMicroseconds(scrollSpeed);
        analogWrite(levelPin, 255);
      }
      else {
        delayMicroseconds(scrollSpeed / 2);
      }
      if (G[x][y]) {                          // If the Green bit is on, display it at the brighness specified, otherwise delay for about half the time it would have taken to 
        bitClear(PORTD, __latchBit);          // display it (this keeps the scrolling message from speeding up when displaying the empty spaces between each letter)
        shiftOutFast(0);
        
        shiftOutFast(ledpy);
        analogWrite(levelPin, 255 - G[x][y]);
        shiftOutFast(0);
        shiftOutFast(ledpx);
        bitSet(PORTD, __latchBit);
        delayMicroseconds(scrollSpeed);
        analogWrite(levelPin, 255);
      }
      else {
        delayMicroseconds(scrollSpeed / 2);
      }
      if (B[x][y]) {                          // If the Blue bit is on, display it at the brighness specified, otherwise delay for about half the time it would have taken to 
        bitClear(PORTD, __latchBit);          // display it (this keeps the scrolling message from speeding up when displaying the empty spaces between each letter)
        analogWrite(levelPin, 255 - B[x][y]);
        shiftOutFast(ledpy);
        shiftOutFast(0);
        shiftOutFast(0);
        shiftOutFast(ledpx);
        bitSet(PORTD, __latchBit);
        delayMicroseconds(scrollSpeed);
        analogWrite(levelPin, 255);
      }
      else {
        delayMicroseconds(scrollSpeed / 2);
      }
    }
  }
}


void clearBoard() {
  for (int fx = 0; fx < 8; fx++) {      // Clears the display arrays and turns off all the pixels for each color
    for (int fy = 0; fy < 8; fy++) {
      R[fx][fy] = 0;
      G[fx][fy] = 0;
      B[fx][fy] = 0;
    }
  }
  updateShiftRegisters();
}



void readJoystick() {
  xValue = analogRead(X_PIN);
  yValue = analogRead(Y_PIN);
  // curButtonState = digitalRead(BUTTON_PIN);
  buttonState = digitalRead(BUTTON_PIN);
  lastReadTime = micros();

  // curDir is the signed distance to the origin if its abs(distance) >= threshold, else 0
  if (abs(xValue - X_ORIGIN) >= CHANGE_THRESHOLD) {
    // curXDir = xValue - X_ORIGIN;
    xDir = xValue - X_ORIGIN;
  } else {
    // curXDir = 0;
    xDir = 0;
  }
  if (abs(yValue - Y_ORIGIN) >= CHANGE_THRESHOLD) {
    // curYDir = yValue - Y_ORIGIN;
    yDir = yValue - Y_ORIGIN;
  } else {
    // curYDir = 0;
    yDir = 0;
  }
}

String convertToDirection() {
  if (yDir >= xDir && yDir > -xDir) {
    return "up";
  }else if (yDir < xDir && yDir >= -xDir) {
    return "right";
  }else if (yDir <= xDir && yDir < -xDir) {
    return "down";
  }else if (yDir > xDir && yDir <= -xDir){
    return "left";
  }else {
    return "";
  }
}

void processCommand(String s) {
//  String s = "matrix:3,3,3,4,3,5;foodPosition:3,1";
  int splitPosition = s.indexOf(";");
  int matrixStartIndex = s.indexOf(":");
  String matrixString = s.substring(matrixStartIndex+1, splitPosition);
  // x = 7 - x; y = y
  for (int i=0; i < matrixString.length(); i+=4){
    int posX = matrixString.charAt(i) - '0';
    int posY = matrixString.charAt(i+2) - '0';
    G[7-posX][posY] = 128;
  }

  if (s.indexOf("foodPosition") > 0) {
    char x = s.charAt(s.length()-3);
    char y = s.charAt(s.length()-1);
    foodX = x - '0';
    foodY = y - '0';
    R[7-foodX][foodY] = 128;
  }
  
  updateShiftRegisters();

}
bool isPressed(byte buttonState) {
  // buttonState (internal pull-up resistor): HIGH -> button not pressed
  // buttonState (internal pull-up resistor): LOW  -> button pressed
  if (buttonState == HIGH) {
    return false;
  } else {
    return true;
  }
}

void showWelcomeMessage(){
   for (int i = 0; i < displayString.length(); i++) {   // Takes the string to be displayed (stored in displayString) and generates the screen[] array the program will shift through
    ascii = (int(displayString[i]) - 32) * 2;          // The ASCII font table starts at ASCII 0x20, the offset is calculated and stored in the ascii variable
    for (int k = ascii; k < ascii + 2; k++) {          // Each character is stored as two unsigned 32 bit integers, so the program reads two 32 bit integers and combines them into a 
      long partial_ll = pgm_read_dword_near(font + k); // unsigned 64 bit integer by shifting the first 32 bits over 32 bits and adding the second 32 bits
      if (k == ascii) {
        longLong = partial_ll;
        longLong = longLong << 32;
      } else {
        longLong = longLong + partial_ll;
      }
    }
    arrayLength = arrayLength + 8;                     // Each individual bitmapped column is read by repeatedly binary "ANDing" the 64 bit integer and then shifting the 64 bit integer
    do {   // 8 bits to the right until the 64 bit integer is "empty".  Since the bitmap is created right-to-left, the screen[] array is filled the same way; right-to left
      byteRead = longLong & 255;                      
      screen[arrayLength] = byteRead;
      arrayLength--;
      longLong = longLong >> 8;
    } while (longLong > 0);
    arrayLength = arrayLength + 7;
  }
}

void setup() {
  pinMode(latchPin, OUTPUT);
  pinMode(dataPin, OUTPUT);
  pinMode(clockPin, OUTPUT);
  pinMode(X_PIN, INPUT);
  pinMode(Y_PIN, INPUT);
  pinMode(BUTTON_PIN, INPUT_PULLUP);  // activate internal pull-up resistor on the push-button pin
  attachInterrupt(0, press, LOW);
  //pinMode(LED_PIN, OUTPUT);
  Serial.begin(115200);
  Serial.setTimeout(300);
  TCCR1B = TCCR1B & 0b11111000 | 0x01;  // Sets the PWM frequency for pin 10 to 31372.55 Hz (a higher frequency is needed because of the speed which the 8x8 matrix is parsed through)
  clearBoard();
  if (!gameInPlay) {
    showWelcomeMessage();
  } else {
    // Render matrix
    updateShiftRegisters();
  }
}
void loop() {
  if (micros() - lastReadTime >= DEBOUNCE_DELAY) { // debounce
    readJoystick();

    //String joystickState = String(xDir) + ',' + String(yDir) + ',' + String(isPressed(buttonState));
    String direction = convertToDirection();
    if (direction != "") Serial.println(direction);
    if (Serial.available()){
      command = Serial.readString();
    }
//    Serial.println(command);
    // y = x, x = 7-y
    if (command.length() > 1){
        clearBoard();
        if (command.equals("GAME OVER")) {
//          displayString = "GAME OVER";
          gameInPlay = false;
          //memset(screen, 0, sizeof(screen));
          
          showWelcomeMessage();
//          Serial.println(displayString);
        }else{
          processCommand(command);
        }
    }
    command = "";
   
    if (!gameInPlay && buttonPressed) {
      gameInPlay = true; 
      Serial.println("press");
      clearBoard();
      buttonPressed = false;
    }
    if (!gameInPlay) {
      clearBoard();
      r = 2;
      b = 0;
      g = 0;
      if (r+g+b>120) { g = 0;}
      for (int j = 0; j < arrayLength; j++) {                 // Strores the current 8x8 matrix with the bitmap to be displayed
        for (int fx = 0; fx < 8; fx++) {
          for (int fy = 7; fy > 0; fy--) {
            R[fy][fx] = bitRead(screen[fx + j], 7 - fy) * r *64;
            G[fy][fx] = bitRead(screen[fx + j], 7 - fy) * g *64;
            B[fy][fx] = bitRead(screen[fx + j], 7 - fy) * b* 64;
          }
          updateShiftRegisters();
        }
      }
    }else {
      updateShiftRegisters();
    }
  }
}

