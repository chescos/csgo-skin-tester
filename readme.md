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

## Setup

### Install the SourceMod Plugin on your CS:GO server

In order to work, this application needs a CS:GO server that connects to it through a socket. You need to install the CS:GO Skin Tester [SourceMod Plugin](https://github.com/chescos/csgo-skin-tester-sm) for that. Detailed instructions for the installation can be found in the readme of the repository.

Note that you can add the plugin to multiple CS:GO servers, and you can connect the plugin of each server to the same web app. This way, you can have one web app that works with any number of CS:GO servers.


### Add Steam Accounts

This app requires at least one Steam account in order to extract data from the CS:GO inspect links through the Steam API. Each Steam account can only inspect one skin at a time, so if you have some traffic then you might consider to add more than just one Steam account. The more Steam accounts, the more concurrent requests the app can serve.

You can add new Steam accounts to the database through the `node cmd account:create` command. Here's an example:

```
node cmd account:create --user user123 --password password123 --secret secret123
```

The `user` argument is the Steam username, the `password` argument is the account password, and the `secret` is the shared secret which is required to login through 2FA.

If you want to want to remove a Steam account from the database, simply use this command:

```
node cmd account:destroy --user user123
```

### Disable IPv6

You should disable support for IPv6 requests when hosting this web app. The reason is that players are identified by their IP address, and CS:GO servers only support IPv4. So the player will have an IPv4 address on the CS:GO server, and if he makes a request to the web app through IPv6, then he won't be identified correctly on the CS:GO server.

If you're using Cloudflare, you can disable IPv6 through an [API call](https://api.cloudflare.com/#zone-settings-change-ipv6-setting). First, get the ID of the zone (domain) that you want to disable IPv6 for:

```bash
curl -X GET "https://api.cloudflare.com/client/v4/zones" \
     -H "X-Auth-Email: <userEmail>" \
     -H "X-Auth-Key: <apiKey>" \
     -H "Content-Type: application/json"
```

And then disable IPv6 for your zone:

```bash
curl -X PATCH "https://api.cloudflare.com/client/v4/zones/<zoneId>/settings/ipv6" \
     -H "X-Auth-Email: <userEmail>" \
     -H "X-Auth-Key: <apiKey>" \
     -H "Content-Type: application/json" \
     --data '{"value":"off"}'
```

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

`POST /tests/link`

##### Input Parameters

|Parameter|Type|Required|Description|
|-|-|-|-|
|link|string|Yes|The inspect link of the CS:GO skin that the player should be equipped with.
|ip|string|No|The IP address of the player that the skin should be sent to. If this is ommitted, the IP address of the client that makes the request is used.|

##### Description

This endpoint sends a skin to a player on the CS:GO game server based on a provided inspect link. If the player is already connected to the CS:GO server, he will be immediately equipped with the skin. If the player is not connected to the CS:GO server yet, this endpoint will return a URL that the player can be connected to via Javascript (e.g `window.location`).

##### Response Examples

Here's an example response that occurs when the player is not connected to the server yet. On the client side, you should always check for the `needs_to_connect` property and if it is `true`, then use the `connect_to_url` to connect the player to the CS:GO server. This can be done by visiting the URL in the browser, e.g through `window.location`. After the user connects to the server, he will be automatically equipped with the skin.

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

#### Send skin to player through `market_hash_name`

##### Endpoint

`POST /tests/name`

##### Input Parameters

|Parameter|Type|Required|Description|
|-|-|-|-|
|market_hash_name|string|Yes|The `market_hash_name` of the CS:GO skin that the player should be equipped with.
|seed|integer|No|The seed (also called pattern ID) that should be used for the skin. This must be a number between `1` and `1000`. This can be used to apply a special version of a Fade or Case Hardened skin.
|paintkit|integer|No|The paintkit index (also called finish catalog) that should be used for the skin. This can be used to apply a certain phase for a Doppler or Gamma Doppler.
|ip|string|No|The IP address of the player that the skin should be sent to. If this is ommitted, the IP address of the client that makes the request is used.|

##### Description

This endpoint sends a skin to a player on the CS:GO game server based on a provided `market_hash_name`. See the description of [Send skin to player through inspect link](#send-skin-to-player-through-inspect-link) for more details.

##### Response Examples

See the response examples of [Send skin to player through inspect link](#send-skin-to-player-through-inspect-link).

#### Send skin to player through skin `id`

##### Endpoint

`POST /tests/id`

##### Input Parameters

|Parameter|Type|Required|Description|
|-|-|-|-|
|skin_id|integer|Yes|The `id` of the CS:GO skin that the player should be equipped with.
|wear|float|No|The wear value that should be applied to the skin. Must be between `0.00000000000000001` and `0.99999999999999999`.
|seed|integer|No|The seed (also called pattern ID) that should be used for the skin. This must be a number between `1` and `1000`. This can be used to apply a special version of a Fade or Case Hardened skin.
|stattrak|integer|no|The StatTrak™ kill count that should be applied to the skin.
|ip|string|No|The IP address of the player that the skin should be sent to. If this is ommitted, the IP address of the client that makes the request is used.|

##### Description

This endpoint sends a skin to a player on the CS:GO game server based on a provided skin `id`. See the description of [Send skin to player through inspect link](#send-skin-to-player-through-inspect-link) for more details.

##### Response Examples

See the response examples of [Send skin to player through inspect link](#send-skin-to-player-through-inspect-link).

#### List all items

##### Endpoint

`GET /items`

##### Description

This endpoint lists all CS:GO items for which skins are available.

##### Response Examples

Here's an example response:

```json
{
  "items": [
    {
      "id": 8,
      "name": "AK-47",
      "name_technical": "weapon_ak47",
      "defindex": 7,
      "image_url": "https://steamcdn-a.akamaihd.net/apps/730/icons/econ/weapons/base_weapons/weapon_ak47.a320f13fea4f21d1eb3b46678d6b12e97cbd1052.png",
      "class": "weapon_ak47",
      "type": "Rifle"
    },
    {
      "id": 9,
      "name": "AUG",
      "name_technical": "weapon_aug",
      "defindex": 8,
      "image_url": "https://steamcdn-a.akamaihd.net/apps/730/icons/econ/weapons/base_weapons/weapon_aug.6b97a75aa4c0dbb61d81efb6d5497b079b67d0da.png",
      "class": "weapon_aug",
      "type": "Rifle"
    }
  ]
}
```

#### List all paintkits

##### Endpoint

`GET /paintkits`

##### Description

This endpoint lists all available paintkits.

##### Response Examples

Here's an example response:

```json
{
  "paintkits": [
    {
      "id": 1,
      "name": "Spruce DDPAT",
      "name_technical": "handwrap_camo_grey",
      "defindex": 10010
    },
    {
      "id": 2,
      "name": "Badlands",
      "name_technical": "handwrap_fabric_orange_camo",
      "defindex": 10036
    }
  ]
}
```

#### List all skins

##### Endpoint

`GET /skins`

##### Description

This endpoint lists all available skins.

##### Response Examples

Here's an example response:

```json
{
  "skins": [
    {
      "id": 1,
      "name": "Hand Wraps | Spruce DDPAT",
      "name_technical": "leather_handwraps_handwrap_camo_grey",
      "image_url": "https://steamcdn-a.akamaihd.net/apps/730/icons/econ/default_generated/leather_handwraps_handwrap_camo_grey_light_large.04557b1a8d68bccdd60b18521346091328756ded.png",
      "item": {
        "id": 1,
        "name": "Hand Wraps",
        "name_technical": "leather_handwraps",
        "defindex": 5032,
        "image_url": "",
        "class": "wearable_item",
        "type": "Gloves"
      },
      "paintkit": {
        "id": 1,
        "name": "Spruce DDPAT",
        "name_technical": "handwrap_camo_grey",
        "defindex": 10010
      }
    },
    {
      "id": 2,
      "name": "Hand Wraps | Badlands",
      "name_technical": "leather_handwraps_handwrap_fabric_orange_camo",
      "image_url": "https://steamcdn-a.akamaihd.net/apps/730/icons/econ/default_generated/leather_handwraps_handwrap_fabric_orange_camo_light_large.f8453c60f74a846bd3c05310de4f004cd95a1aa2.png",
      "item": {
        "id": 1,
        "name": "Hand Wraps",
        "name_technical": "leather_handwraps",
        "defindex": 5032,
        "image_url": "",
        "class": "wearable_item",
        "type": "Gloves"
      },
      "paintkit": {
        "id": 2,
        "name": "Badlands",
        "name_technical": "handwrap_fabric_orange_camo",
        "defindex": 10036
      }
    }
  ]
}
```

## Software Suite

The CS:GO Skin Tester backend works in conjunction with a set of related tools. At least the SourceMod plugin for the CS:GO server is required to make it work.

- [NodeJS Backend](https://github.com/chescos/csgo-skin-tester) (this repository)
- [SourceMod Plugin](https://github.com/chescos/csgo-skin-tester-sm)
- [Frontend](https://github.com/chescos/csgo-skin-tester-frontend)
- [Chrome Extension](https://github.com/chescos/csgo-skin-tester-extension)


