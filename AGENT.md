# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

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

- **Framework:** Svelte PWA, mobile-first
- **Audio:** 700Hz sine wave via Web Audio API
- **Input:** Listens to both touch events and keyboard Spacebar (for physical key input)
- **Mechanic:** "Simon Says" rhythm game — app plays pattern, user mimics to advance
