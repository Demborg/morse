#include <Arduino.h>
#include <BleKeyboard.h>

// Pin Definitions
#define KEY_PIN 5
#define BUTTON_PIN 9
#define LED_PIN 8 // LED1 on Olimex ESP32-C3-DevKit-Lipo is GPIO 8

// Timing Constants (based on GEMINI.md and standard Morse)
#define UNIT_MS 80
#define DIT_MAX_MS (UNIT_MS * 2) // 160ms - threshold between dit and dah
#define LETTER_TIMEOUT_MS (UNIT_MS * 3) // 240ms - end of character (standard 3 units)
#define WORD_TIMEOUT_MS (UNIT_MS * 10) // 800ms - spacebar timeout (extended to 10 units for easier typing)

BleKeyboard bleKeyboard("Morse Key", "Morse Project", 100);

// State
bool isKeyboardMode = true; // default
bool lastKeyState = HIGH;
bool lastButtonState = HIGH;

// Timing State
unsigned long keyDownTime = 0;
unsigned long keyUpTime = 0;
String currentSymbol = "";
bool wordSpaceSent = true;

// Morse translation table
struct MorseChar {
  const char* morse;
  char character;
};

const MorseChar morseTable[] = {
  {".-", 'a'}, {"-...", 'b'}, {"-.-.", 'c'}, {"-..", 'd'}, {".", 'e'},
  {"..-.", 'f'}, {"--.", 'g'}, {"....", 'h'}, {"..", 'i'}, {".---", 'j'},
  {"-.-", 'k'}, {".-..", 'l'}, {"--", 'm'}, {"-.", 'n'}, {"---", 'o'},
  {".--.", 'p'}, {"--.-", 'q'}, {".-.", 'r'}, {"...", 's'}, {"-", 't'},
  {"..-", 'u'}, {"...-", 'v'}, {".--", 'w'}, {"-..-", 'x'}, {"-.--", 'y'},
  {"--..", 'z'}, {".----", '1'}, {"..---", '2'}, {"...--", '3'},
  {"....-", '4'}, {".....", '5'}, {"-....", '6'}, {"--...", '7'},
  {"---..", '8'}, {"----.", '9'}, {"-----", '0'},
  // Punctuation could be added here
};

const int morseTableSize = sizeof(morseTable) / sizeof(morseTable[0]);

char translateMorse(const String& symbol) {
  for (int i = 0; i < morseTableSize; i++) {
    if (symbol == morseTable[i].morse) {
      return morseTable[i].character;
    }
  }
  return 0; // Return 0 if not found
}

void setup() {
  Serial.begin(115200);
  
  // Wait up to 2s for Serial to be ready
  while (!Serial && millis() < 2000) {
    delay(10);
  }
  
  Serial.println("Initializing Morse Key...");
  
  pinMode(KEY_PIN, INPUT_PULLUP);
  pinMode(BUTTON_PIN, INPUT_PULLUP);
  pinMode(LED_PIN, OUTPUT);
  
  // Blink to confirm LED1 is working
  digitalWrite(LED_PIN, HIGH);
  delay(200);
  digitalWrite(LED_PIN, LOW);
  delay(200);
  
  digitalWrite(LED_PIN, isKeyboardMode ? HIGH : LOW);
  
  bleKeyboard.begin();
  
  Serial.println("Setup complete. Waiting for BLE connection.");
}

void loop() {
  unsigned long now = millis();
  
  // -- Button Handling (Mode Toggle) --
  bool currentButtonState = digitalRead(BUTTON_PIN);
  if (currentButtonState != lastButtonState) {
    if (currentButtonState == LOW) { // Button Pressed
      isKeyboardMode = !isKeyboardMode;
      digitalWrite(LED_PIN, isKeyboardMode ? HIGH : LOW);
      Serial.print("Mode switched to: ");
      Serial.println(isKeyboardMode ? "Keyboard Mode" : "Trainer Mode");
      
      // Reset state on mode switch
      currentSymbol = "";
      wordSpaceSent = true;
      if (!isKeyboardMode && lastKeyState == LOW) {
        // If key was held down while switching to trainer, press space
        bleKeyboard.press(' ');
      } else if (isKeyboardMode) {
        // Release space if we switched to keyboard mode
        bleKeyboard.release(' ');
      }
    }
    lastButtonState = currentButtonState;
    delay(50); // Debounce button
  }

  // -- Key Handling --
  bool currentKeyState = digitalRead(KEY_PIN);

  if (currentKeyState != lastKeyState) {
    if (currentKeyState == LOW) { // Key Pressed (Active Low)
      keyDownTime = now;
      
      if (!isKeyboardMode) {
        Serial.println("Trainer Mode: Key Pressed -> Space");
        bleKeyboard.press(' '); 
      }
    } else { // Key Released
      keyUpTime = now;
      unsigned long duration = keyUpTime - keyDownTime;
      
      if (!isKeyboardMode) {
        Serial.println("Trainer Mode: Key Released");
        bleKeyboard.release(' ');
      } else {
        // Keyboard mode logic
        if (duration < DIT_MAX_MS) {
          currentSymbol += ".";
          Serial.print(".");
        } else {
          currentSymbol += "-";
          Serial.print("-");
        }
        wordSpaceSent = false;
      }
    }
    lastKeyState = currentKeyState;
    delay(15); // Debounce key
  }

  // -- Keyboard Mode Idle Handling --
  if (isKeyboardMode && currentKeyState == HIGH) {
    // Character timeout
    if (currentSymbol.length() > 0 && (now - keyUpTime) > LETTER_TIMEOUT_MS) {
      char c = translateMorse(currentSymbol);
      if (c != 0) {
        Serial.print(" -> ");
        Serial.println(c);
        if (bleKeyboard.isConnected()) {
          bleKeyboard.print(String(c));
        }
      } else {
        Serial.println(" -> ? (Unknown symbol)");
      }
      currentSymbol = "";
    }
    
    // Word space timeout
    if (!wordSpaceSent && currentSymbol.length() == 0 && (now - keyUpTime) > WORD_TIMEOUT_MS) {
      Serial.println(" -> [SPACE]");
      if (bleKeyboard.isConnected()) {
        bleKeyboard.print(" ");
      }
      wordSpaceSent = true;
    }
  }

  // Small yield to allow BLE stack to process events
  delay(1);
}
