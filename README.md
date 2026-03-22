Demborg/morse
A wildly impractical Bluetooth keyboard built from a vintage Morse code key, accompanied by a mobile-first Svelte web app to actually learn how to type on it.

📖 The Vision
I have reallized that my keyboard setup is following a trajectory, going from normal and booring to tactile and then realizing the beuty of minimal setups like the ergodox plank and Voyager. 

Having found an old morse key i bought as a kid I now clearly see the logical conclusion to all of this; a single highly tactile and beutiful button. Beacause typing is no longer about speed (some ai solves that anyways?) it is about tactility and the art of the craft that is closing tactile contactors.

📂 Repository Structure
/firmware - The PlatformIO C++ codebase for the ESP32-C3.

/trainer - The Svelte-based mobile web application for learning Morse.

🛠️ Hardware
Vintage Morse Key: Any standard tactile telegraph key.

Olimex ESP32-C3: Chosen for native BLE 5 support and low power consumption.

3.7V LiPo Battery: For untethered typing.

💻 Firmware (ESP32 / PlatformIO)
The embedded logic is written in C++ using the Arduino framework via PlatformIO.

BLE Stack: Utilizes the ESP32-BLE-Keyboard library to handle HID advertising and pairing.

Typing Mode: A state machine that measures the delta between press and release to classify signals into DIT and DAH, sending actual keystrokes to the host device.

Trainer Mode: A raw passthrough mode that simply maps the physical key to a standard Spacebar HID output, allowing the key to interface directly with the web trainer.

⚠️ Open Architecture Questions:

Handling Control Characters: Traditional Morse lacks Tab, Enter, and Backspace. The current roadmap includes experimenting with a hybrid UI approach (e.g., implementing a modern smartphone "Long Hold" state) versus using historical procedural signals (Prosigns).

📱 Frontend Trainer (Svelte)
A mobile-first web app designed to train the ear-to-hand loop.

- **Mechanics:** 
    - **SRS (Spaced Repetition):** Intelligent learning loop that introduces characters from a curriculum and uses spaced repetition to ensure mastery.
    - **Task Types:** Practice through `mimic` (listen and repeat), `listen` (multiple choice recognition), and `recall` (translating symbols from memory).
    - **Word Mode:** Practice full words using characters already mastered in the learning curriculum.

- **Audio & Visuals:** Plays a 700Hz sine wave (via Web Audio API) and provides aggressive visual feedback (flashing the screen/touch target) for both inputs and demos.

- **Input Agnostic:** Listens to both native touch events (for mobile practice) and standard keyboard events (listening for the Spacebar so the physical Morse key can be used as the input device).

- **Timing (80ms unit):** 
    - DIT: 1 unit (80ms)
    - DAH: 3 units (240ms)
    - DIT/DAH Threshold: 2 units (160ms)
    - End-of-input Timeout: 6 units (480ms)
