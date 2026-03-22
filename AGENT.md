# Guidelines for AI Agents

This file provides guidance to AI agents when working with code in this repository.

## Project Overview

A Bluetooth keyboard built from a vintage Morse code key (ESP32-C3), paired with a mobile-first Svelte web app for learning Morse code typing.

## Repository Structure

- `/firmware` - PlatformIO C++ codebase for ESP32-C3 (Arduino framework, ESP32-BLE-Keyboard library)
- `/trainer` - Svelte-based mobile web app for learning Morse

## Firmware

- **Platform:** ESP32-C3 via PlatformIO with Arduino framework
- **BLE:** Uses ESP32-BLE-Keyboard for HID advertising/pairing
- **Modes:** Typing mode (DIT/DAH state machine → keystrokes) and Trainer mode (key → Spacebar passthrough)
- **Build/upload:** `cd firmware && pio run` / `pio run -t upload`

## Project Setup & Workflow

- **Setup:** Run `npm install` in the root to install dev dependencies and initialize Husky.
- **Root Scripts:**
    - `npm run lint:trainer`: Lint the trainer app.
    - `npm run format:trainer`: Format the trainer app code.
    - `npm run check:trainer`: Run Svelte-check on the trainer.
    - `npm run test:trainer`: Run Vitest for the trainer.
- **Pre-commit Hooks:** Managed by Husky and `lint-staged`. On commit, it automatically:
    - Formats modified files in `trainer/`.
    - Runs ESLint, Vitest, and Svelte-check on modified files to ensure quality.

## Code Style & Git Workflow

Inspired by *Clean Code*, *Grokking Simplicity*, and *Extreme Programming*:

- **Functional Preference:** Favor a functional programming style.
- **Self-Documenting Code:** Small, well-named functions are strongly preferred over documentation comments. Code should be readable at each abstraction level.
    - **Anti-pattern:** Using comments as "headers" for blocks of code within a function.
- **Testing:** Always add tests for pure functions when they arise.
- **Atomic Commits:** Each commit must do exactly one thing.
    - **Anti-pattern:** Using the word "and" in commit messages (indicates a non-atomic commit).

## Trainer App

- **Framework:** SvelteKit 5 with TypeScript, mobile-first
- **Dev server:** `cd trainer && npm run dev`
- **Build:** `cd trainer && npm run build`
- **Audio:** 700Hz sine wave via Web Audio API (persistent oscillator toggled via GainNode in `$lib/audio.ts`)
- **Input:** Listens to both touch events and keyboard Spacebar via `$lib/input.svelte.ts`
- **Mechanics:** 
    - **SRS (Spaced Repetition System):** Managed in `$lib/srs.svelte.ts`. Introduces characters from a curriculum and tracks progress.
    - **Task Types:** `mimic` (listen and repeat), `listen` (multiple choice), and `recall` (type from memory).
    - **Modes:** 
        - `Learn` (+page.svelte at `/learn`): Focuses on individual characters using SRS.
        - `Words` (+page.svelte at `/words`): Practice with words formed from learned characters.
- **Timing model:** 1 unit = 80ms. DIT = 1 unit, DAH = 3 units. DIT/DAH threshold = 2 units (160ms). End-of-input timeout = 6 units (480ms).
- **Game state:** `idle → demo → listening → success/retry` loop managed in `state.svelte.ts` within route folders using Svelte 5 runes (`$state`).
