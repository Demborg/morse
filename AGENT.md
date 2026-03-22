# Guidelines for AI Agents

This file provides guidance to AI agents when working with code in this repository.

## Project Overview

A Bluetooth keyboard built from a vintage Morse code key (ESP32-C3), paired with a mobile-first Svelte web app for learning Morse code typing.

## Repository Structure

- `/firmware` - PlatformIO C++ codebase for ESP32-C3 (Arduino framework, ESP32-BLE-Keyboard library)
- `/trainer` - Svelte-based mobile PWA for learning Morse

## Firmware

- **Platform:** ESP32-C3 via PlatformIO with Arduino framework
- **BLE:** Uses ESP32-BLE-Keyboard for HID advertising/pairing
- **Modes:** Typing mode (DIT/DAH state machine → keystrokes) and Trainer mode (key → Spacebar passthrough)
- **Build/upload:** `cd firmware && pio run` / `pio run -t upload`

## Trainer App

- **Framework:** SvelteKit 5 with TypeScript, mobile-first
- **Dev server:** `cd trainer && npm run dev`
- **Build:** `cd trainer && npm run build`
- **Audio:** 700Hz sine wave via Web Audio API (persistent oscillator toggled via GainNode)
- **Input:** Listens to both touch events and keyboard Spacebar (for physical key input)
- **Mechanic:** "Simon Says" rhythm game — app plays pattern, user mimics to advance
- **Timing model:** 1 unit = 120ms. DIT = 1 unit, DAH = 3 units. DIT/DAH threshold = 2 units (240ms). End-of-input timeout = 6 units (720ms).
- **Game state:** `idle → demo → listening → success/retry → demo` loop managed in `game.svelte.ts` using Svelte 5 runes (`$state`)
