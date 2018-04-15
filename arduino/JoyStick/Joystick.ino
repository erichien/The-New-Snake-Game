const int X_PIN = A1;
const int Y_PIN = A0;
const int BUTTON_PIN = 2;
const int LED_PIN = 13;
const unsigned long DEBOUNCE_DELAY = 10;  // milliseconds
const int X_ORIGIN = 520;
const int Y_ORIGIN = 526;
const int CHANGE_THRESHOLD = 100;  // defines sensitivity to changing x and y's direction

int curXDir = 0; // -512 to -100 (left), 0 (unchanged), 100 to 512 (right)
int curYDir = 0;
int oldXDir = 0;
int oldYDir = 0;
int xValue = X_ORIGIN; // 0 to 1024
int yValue = Y_ORIGIN;
byte curButtonState = HIGH;  // since pull-up resistor is used, assume switch open, initial pin value HIGH
byte oldButtonState = HIGH;
bool buttonPressed = false;
bool xDirChanged = false;
bool yDirChanged = false;
bool buttonStateChanged = false;
unsigned long lastReadTime = 0;  // when the button last changed state


void setup() {
  Serial.begin(9600);  // initialize serial connection with a baudrate of 115200
  //  TODO: change to 115200 when connected to Pi

  pinMode(X_PIN, INPUT);
  pinMode(Y_PIN, INPUT);
  pinMode(BUTTON_PIN, INPUT_PULLUP);  // activate internal pull-up resistor on the push-button pin
  pinMode(LED_PIN, OUTPUT);
}


void readJoystick() {
  xValue = analogRead(X_PIN);
  yValue = analogRead(Y_PIN);
  curButtonState = digitalRead(BUTTON_PIN);
  lastReadTime = millis();
  Serial.println(xValue);

  // curDir is the signed distance to the origin if its abs(distance) >= threshold, else 0
  if (abs(xValue - X_ORIGIN) >= CHANGE_THRESHOLD) {
    curXDir = xValue - X_ORIGIN;
  } else {
    curXDir = 0;
  }
  if (abs(yValue - Y_ORIGIN) >= CHANGE_THRESHOLD) {
    curYDir = yValue - Y_ORIGIN;
  } else {
    curYDir = 0;
  }
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


void loop() {
  if (millis() - lastReadTime >= DEBOUNCE_DELAY) { // debounce
    readJoystick();

    // only send new data to server when curXDir or curYDir is not 0, and is different from its last state
    // oldDir could be 0, if curDir !=0 -> xDirChanged = True
    // curDir and oldCur must first divide by abs value to get +-1, to prevent overflow
    // the first time curXDir becomes nonzero, (oldXDir /= abs(oldXDir) will have zero division, but yeilds value 1
    // but resulting in (curXDir /= abs(curXDir)) * (oldXDir /= abs(oldXDir)) <= 0 to yield -1
    xDirChanged = ( curXDir != 0 && ((curXDir /= abs(curXDir)) * (oldXDir /= abs(oldXDir)) <= 0) ); // oldDir could be 0, if curDir !=0 -> xDirChanged = True
    yDirChanged = ( curYDir != 0 && ((curYDir /= abs(curYDir)) * (oldYDir /= abs(oldYDir)) <= 0) ); // must divide by abs value to get +-1, to prevent overflow
    buttonStateChanged = curButtonState != oldButtonState;

    // for the game, only x y value change is important
    // also snake can only change one direction at once -> check whichever abs(xDir), abs(yDir) is bigger
    // -> send one of x, y dir, or both? (e.g. joystick pushed towards top-right)

    if (xDirChanged || yDirChanged || buttonStateChanged) { // only send new state when any value changes

      if (xDirChanged) {
        Serial.print(oldXDir);
        Serial.print('-');
        Serial.print(curXDir);
        Serial.print('-');
        Serial.println( (curXDir * oldXDir) );
        oldXDir = curXDir;
      }
      if (yDirChanged) {
        oldYDir = curYDir;
      }
      if (buttonStateChanged) {
        oldButtonState = curButtonState;
      }

      // send old states for unchanged states
      String newState = String(oldXDir) + ',' + String(oldYDir) + ',' + String(isPressed(oldButtonState));
      Serial.println(newState);
    }
  }
}
