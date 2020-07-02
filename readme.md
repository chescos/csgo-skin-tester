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

## REST API

### Errors

Error responses always have a 4XX or 5XX HTTP status code. Additionally, errors always have an `id` and a `message` property. Here's an example:

```json
{
  "id": "SERVER_ERROR",
  "message": "Ouch! An unexpected server error occurred."
}
```

The `message` string is user-friendly and can be displayed to directly to end users.

Here's a full list of all errors:

|ID|Status Code|Message|
|-|-|-|
|VALIDATION_ERROR|400|This message varies depending on the validation error.|
|UNSUPPORTED_SKIN|400|Sorry but this skin is currently not supported.|
|NOT_FOUND|404|Whoops, this endpoint does not exist.|
|ALL_SERVERS_FULL|500|Sorry, all of our CS:GO test servers are currently full. Please try again later.|
|INSPECTION_FAILED|500|Failed to inspect the given CS:GO inspect link, please try again.|
|SERVER_ERROR|500|Ouch! An unexpected server error occurred.|

### Endpoints

#### Send skin to player through inspect link

##### Endpoint

`POST /inspect-links`

##### Input Parameters

|Parameter|Type|Required|Description|
|-|-|-|-|
|link|string|Yes|The CS:GO inspect link of the item that the player should be equipped with.
|ip|string|No|The IP address of the player that the skin should be sent to. If this is ommitted, the IP address of the client that makes the request is used.|

##### Description

This endpoint sends a skin to a player on the CS:GO game server based on a provided inspect link. If the player is already connected to the CS:GO server, he will immediately be equipped with the skin. If the player is not connected to the CS:GO server yet, this endpoint will return a URL that the player can be connected to via Javascript (e.g `window.location`).

##### Response Examples

Here's an example response that occurs when the player is not connected to the server yet. On the client side, you should always check for the `needs_to_connect` property and if it is `true`, then use the `connect_to_url` to connect the player to the CS:GO server. This can be done by visiting the URL in the browser, e.g through `window.location`. After the user connects to the server, he will be automatically be equipped with the skin.

```json
{
  "success": true,
  "needs_to_connect": true,
  "connect_to_server": "93.186.198.123:21015",
  "connect_to_url": "steam://connect/93.186.198.123:21015"
}
```

If the player is already connected to the server, no action is needed. He will be immediately equipped with the CS:GO skin.

```json
{
  "success": true,
  "needs_to_connect": false,
  "connect_to_server": null,
  "connect_to_url": null
}
```

## Software Suite

The CS:GO Skin Tester backend works in conjunction with a set of related tools. At least the SourceMod plugin for the CS:GO server is required to make it work.

- [NodeJS Backend](https://github.com/chescos/csgo-skin-tester) (this repository)
- [SourceMod Plugin](https://github.com/chescos/csgo-skin-tester-sm)
- [Frontend](https://github.com/chescos/csgo-skin-tester-frontend)
- [Chrome Extension](https://github.com/chescos/csgo-skin-tester-extension)


