## CS:GO Skin Tester

This app allows inspecting skins from other players in-game, on a game server.
This works by providing an inspect link for the desired skin.

## Installation

1. Run `cp .env.example .env` and fill out all env variables
2. Run `npm run migrate` to run all database migrations
3. Run `npm run skins:update` to parse all skins and insert them into the database
4. Run `npm run start` to start the app
