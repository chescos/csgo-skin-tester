## CS:GO Skin Tester

This app allows inspecting skins from other players in-game, on a game server.
This works by providing an inspect link for the desired skin.

## Installation

1. Clone this repository
2. Run `npm install` to install all dependencies
3. Run `cp .env.example .env` and fill out all env variables
4. Run `npm run migrate` to run all database migrations
5. Run `npm run skins:update` to parse all skins and insert them into the database
6. Run `npm run start` to start the app

## Software Suite

The CS:GO Skin Tester backend works in conjunction with a set of related tools. At least the SourceMod plugin for the CS:GO server is required to make it work.

- [NodeJS Backend](https://github.com/chescos/csgo-skin-tester) (this repository)
- [SourceMod Plugin](https://github.com/chescos/csgo-skin-tester-sm)
- [Frontend](https://github.com/chescos/csgo-skin-tester-frontend)
- [Chrome Extension](https://github.com/chescos/csgo-skin-tester-extension)


