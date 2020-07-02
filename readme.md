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

## Environment Variables

|Variable|Type|Default|Description|
|-|-|-|-|
|NODE_ENV|string|development|The current environment. Possible values are `development` and `production`. Make sure to set this to `production` when you're going live.|
|WEB_PORT|integer|3000|The port that the Express web server is listening to.|
|SOCKET_PORT|integer|8080|The port that the socket server is listening to.|
|APP_KEY|string|none|The app key. This key should be a random string that is used to encrypt Steam account credentials.|
|DATABASE_URL|string|none|The URL of the PostgreSQL database that is used by the application.|
|DATABASE_DEBUG|boolean|true|Whether to log database queries or not.|
|DATABASE_SSL|boolean|false|Whether to connect to the database through SSL.|
|DATABASE_MIN_CONNECTIONS|integer|1|The minimum number of open database connections.|
|DATABASE_MAX_CONNECTIONS|integer|10|The maximum number of open database connections.|
|STEAM_API_KEY|string|none|The Steam API key that is used to interact with the Steam API.|
|INSPECT_TIMEOUT_MS|integer|3000|The time in milliseconds after which an inspect request times out if no response from Steam is received.|

## Software Suite

The CS:GO Skin Tester backend works in conjunction with a set of related tools. At least the SourceMod plugin for the CS:GO server is required to make it work.

- [NodeJS Backend](https://github.com/chescos/csgo-skin-tester) (this repository)
- [SourceMod Plugin](https://github.com/chescos/csgo-skin-tester-sm)
- [Frontend](https://github.com/chescos/csgo-skin-tester-frontend)
- [Chrome Extension](https://github.com/chescos/csgo-skin-tester-extension)


