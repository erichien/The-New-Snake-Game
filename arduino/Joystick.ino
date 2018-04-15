const int X_PIN = A1;
const int Y_PIN = A0;
const int BUTTON_PIN = 2;
const int LED_PIN = 13;
const unsigned long DEBOUNCE_TIME = 10;  // milliseconds

int xValue = 0;
int yValue = 0;
byte curButtonState = HIGH;  // since pull-up resistor is used, assume switch open, initial pin value HIGH
byte oldButtonState = HIGH;
unsigned long lastPressedTime;  // when the button last changed state

void setup() {
  Serial.begin(9600);  // initialize serial communications at 9600 bps:
  //  TODO: change to 115200

  pinMode(X_PIN, INPUT);
  pinMode(Y_PIN, INPUT);
  pinMode(BUTTON_PIN, INPUT_PULLUP);  // activate internal pull-up resistor on the push-button pin
  pinMode(LED_PIN, OUTPUT);
}

void readJoystick() {
  xValue = analogRead(X_PIN);
  yValue = analogRead(Y_PIN);
  curButtonState = digitalRead(BUTTON_PIN);
}

void outputButtonState(byte buttonState) {

  // buttonState: HIGH -> button not pressed
  // buttonState: LOW  -> button pressed
  if (buttonState == HIGH) {
    Serial.println(false);
    digitalWrite(LED_PIN, LOW);  // if button not pressed, internal pull-up resistor -> HIGH, LED -> LOW
  } else {
    Serial.println(true);
    digitalWrite(LED_PIN, HIGH);  // if button pressed, internal pull-up resistor -> LOW, LED -> HIGH
  }
}

void loop() {

  readJoystick();

  /*
  // print to serial monitor
  Serial.print("X: ");
  Serial.print(xValue);
  Serial.print(" | Y: ");
  Serial.print(yValue);
  Serial.print(" | Pressed: ");
  */

  if (curButtonState != oldButtonState && millis() - lastPressedTime >= DEBOUNCE_TIME) {  // check state and debounce
    oldButtonState = curButtonState;
  }
  outputButtonState(oldButtonState);
}
