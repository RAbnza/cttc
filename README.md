# CTTC Gaze Tracker

AI-powered reading assistance web application with gaze tracking, confusion detection, and vocabulary support.

## Features

- Webcam eye tracking scaffolding with WebGazer.js integration
- Real-time gaze-to-word mapping and reading progress
- Confusion detection based on fixation and reread signals
- Vocabulary assistance with definitions, synonyms, pronunciation, and examples
- Analytics dashboard with session metrics and rhythm charts
- Local session persistence using localStorage

## Architecture Highlights

- Modular React components organized by domain
- Typed data models for reading metrics and vocabulary data
- Hooks for gaze tracking, session simulation, and storage
- Express API for vocabulary lookup and MongoDB session models

## Getting Started

1. Install frontend dependencies:
   npm install

2. Install backend dependencies:
   npm install --prefix server

3. Configure environment variables:
   - Copy .env.example to .env for the frontend
   - Copy server/.env.example to server/.env for the backend

4. Add WebGazer.js build to public/webgazer.js to enable webcam tracking.

5. Start the backend:
   npm run dev --prefix server

6. Start the frontend:
   npm run dev

## Scripts

Frontend:
- npm run dev
- npm run build
- npm run preview

Backend:
- npm run dev --prefix server
- npm run build --prefix server
- npm run start --prefix server

## Folder Map

- src/components: UI building blocks and feature panels
- src/hooks: gaze tracking, session logic, and storage helpers
- src/store: shared reading session state
- src/types: type-safe domain models
- server/src: Express routes, controllers, and MongoDB models
