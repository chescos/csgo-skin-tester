const path = require('path');
const vdf = require('simple-vdf');
const async = require('async');
const axios = require('axios');
const _ = require('lodash');
require('../../database');
const logger = require('../../modules/Logger');
const Item = require('../../database/models/Item');
const Paintkit = require('../../database/models/Paintkit');
const Skin = require('../../database/models/Skin');

const sources = {
  itemsGame: 'https://raw.githubusercontent.com/SteamDatabase/GameTracking-CSGO/master/csgo/scripts/items/items_game.txt',
  itemsGameCdn: 'https://raw.githubusercontent.com/SteamDatabase/GameTracking-CSGO/master/csgo/scripts/items/items_game_cdn.txt',
  csgoEnglish: 'https://raw.githubusercontent.com/SteamDatabase/GameTracking-CSGO/master/csgo/resource/csgo_english.txt',
};

(async () => {
  logger.info('Fetching data...');

  const results = {};

  await async.eachOf(sources, async (url, key) => {
    const response = await axios.get(url);
    results[key] = response.data;
  });

  logger.info('Data fetched. Parsing...');

  results.itemsGame = vdf.parse(results.itemsGame);
  results.csgoEnglish = vdf.parse(results.csgoEnglish);
  results.itemsGameCdn = results.itemsGameCdn.split('\n').reduce((result, line) => {
    if (line.charAt(0) === '#' || line === '') {
      return result;
    }

    const parts = line.split('=');

    // eslint-disable-next-line no-param-reassign
    result[parts[0]] = parts[1]
      .replace('\r', '')
      .replace('\n', '');

    return result;
  }, {});

  _.forEach(results.csgoEnglish.lang.Tokens, (token, key) => {
    delete results.csgoEnglish.lang.Tokens[key];
    results.csgoEnglish.lang.Tokens[key.toLowerCase()] = token;
  });

  logger.info('Data parsed. Extracing skins...');

  const getTranslation = (key) => {
    let translation = false;

    const translationKey = key.replace('#', '').toLowerCase();

    if (results.csgoEnglish.lang.Tokens[translationKey]) {
      translation = results.csgoEnglish.lang.Tokens[translationKey];
    }

    return translation;
  };

  const { items } = results.itemsGame.items_game;
  const paintkits = results.itemsGame.items_game.paint_kits;
  const skins = results.itemsGameCdn;

  const result = [];

  _.forEach(skins, (image, name) => {
    // Skin is a default skin (e.g default AWP, Taser, Smoke Grenade, etc).
    // Ignore those.
    if (_.map(items, 'name').includes(name)) {
      return;
    }

    let matchingItem = null;

    _.forEach(items, (item, key) => {
      const isCurrentlyBestMatch = name.startsWith(item.name)
        && (matchingItem === null || item.name.length > matchingItem.name.length);

      if (isCurrentlyBestMatch) {
        matchingItem = {
          ...item,
          defindex: key,
        };
      }
    });

    const paintname = name.substring(matchingItem.name.length + 1);

    let matchingPaintkit = null;

    _.forEach(paintkits, (paintkit, defindex) => {
      if (paintkit.name.toLowerCase() === paintname) {
        matchingPaintkit = {
          ...paintkit,
          defindex,
        };
      }
    });

    const skinImageUrl = image.replace('http://media.steampowered.com', 'https://steamcdn-a.akamaihd.net');

    // Gloves have no item image, use the skin image instead.
    const imageUrl = results.itemsGameCdn[matchingItem.name] || skinImageUrl;

    const prefab = results.itemsGame.items_game.prefabs[matchingItem.prefab];
    const subPrefab = results.itemsGame.items_game.prefabs[prefab.prefab];

    const itemClass = prefab.item_class || subPrefab.item_class || 'wearable_item';

    const itemName = matchingItem.item_name || prefab.item_name;

    const res = {
      name_technical: name,
      image_url: skinImageUrl,
      item: {
        name_technical: matchingItem.name,
        defindex: matchingItem.defindex,
        image_url: imageUrl,
        class: itemClass,
        name: getTranslation(itemName),
        type: getTranslation(subPrefab.item_type_name),
      },
      paintkit: {
        name_technical: matchingPaintkit.name,
        name: getTranslation(matchingPaintkit.description_tag),
        defindex: matchingPaintkit.defindex,
      },
    };

    res.name = `${res.item.name} | ${res.paintkit.name}`;

    result.push(res);
  });

  logger.info(`Extracted ${result.length} skins. Inserting into database...`);

  const stats = {
    items: 0,
    paintkits: 0,
    skins: 0,
  };

  await async.eachSeries(result, async (data) => {
    let item = await Item.query().findOne('name', data.item.name);

    if (item) {
      item = await item.$query().patch(data.item).returning('*');
    } else {
      item = await Item.query().insert(data.item).returning('*');
      stats.items += 1;
    }

    let paintkit = await Paintkit.query().findOne('name_technical', data.paintkit.name_technical);

    if (paintkit) {
      paintkit = await paintkit.$query().patch(data.paintkit).returning('*');
    } else {
      paintkit = await Paintkit.query().insert(data.paintkit).returning('*');
      stats.paintkits += 1;
    }

    const skin = await Skin.query().findOne('name_technical', data.name_technical);

    const skinData = {
      item_id: item.id,
      paintkit_id: paintkit.id,
      name_technical: data.name_technical,
      name: data.name,
      image_url: data.image_url,
    };

    if (skin) {
      await skin.$query().patch(skinData);
    } else {
      await Skin.query().insert(skinData);
      stats.skins += 1;
    }
  });

  logger.info('All done', stats);
  process.exit();
})();
