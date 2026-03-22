#include <Arduino.h>
#include <BleKeyboard.h>

// GPIO 5 is shorted to ground when the Morse key is pressed.
#define KEY_PIN 5

BleKeyboard bleKeyboard("Morse Key", "Morse Project", 100);
bool lastState = HIGH;

void setup() {
  Serial.begin(115200);
  // Wait up to 2s for Serial to be ready (useful for debugging over USB)
  while (!Serial && millis() < 2000) {
    delay(10);
  }
  
  Serial.println("Initializing Morse Key (Spacebar Mode)...");
  
  pinMode(KEY_PIN, INPUT_PULLUP);
  bleKeyboard.begin();
  
  Serial.println("Setup complete. Waiting for BLE connection.");
}

void loop() {
  bool currentState = digitalRead(KEY_PIN);

  if (currentState != lastState) {
    if (currentState == LOW) { // Key Pressed (Active Low)
      Serial.println("Key Pressed -> Space");
      bleKeyboard.press(' '); 
    } else { // Key Released
      Serial.println("Key Released");
      bleKeyboard.release(' ');
    }
    lastState = currentState;
    
    // Software debounce (15ms is usually enough for a mechanical Morse key)
    delay(15);
  }

  // Small yield to allow BLE stack to process events
  delay(1);
}
