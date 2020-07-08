const config = require('config');
const ErrorResponse = require('../modules/ErrorResponse');
const logger = require('../modules/Logger');
const gameServer = require('../modules/GameServer');
const Skin = require('../database/models/Skin');

exports.store = async (req, res) => {
  const {
    body: {
      skin_id: skinId,
      wear = 0.00000000000000001,
      seed = 1,
      stattrak = -1,
      ip = req.ip,
    },
  } = req;

  const skin = await Skin.query()
    .where('id', skinId)
    .withGraphFetched({
      item: true,
      paintkit: true,
    })
    .first();

  if (!skin) {
    logger.info('Skin does not exist in database, abort');

    return res.status(400).json(ErrorResponse.unsupportedSkin());
  }

  const data = {
    ip,
    paintkit_name: skin.paintkit.name,
    paintkit_defindex: skin.paintkit.defindex,
    item_name: skin.item.name,
    item_defindex: skin.item.defindex,
    item_class: skin.item.class,
    item_name_technical: skin.item.name_technical,
    item_type: skin.item.type,
    wear,
    seed,
    stattrak,
  };

  const isPlayerConnected = gameServer.isPlayerConnected(ip);
  const availableServer = gameServer.getAvailableServer();

  const allServersFull = !isPlayerConnected
    && availableServer === null
    && config.get('env') === 'production';

  if (allServersFull) {
    return res.status(500).json(ErrorResponse.allServersFull());
  }

  if (isPlayerConnected) {
    gameServer.sendSkin(data);
    logger.info('Sent skin', data);
  } else {
    gameServer.queueSkin(data);
    logger.info('Queued skin', data);
  }

  return res.status(201).json({
    success: true,
    needs_to_connect: !isPlayerConnected,
    connect_to_server: isPlayerConnected ? null : availableServer,
    connect_to_url: isPlayerConnected ? null : `steam://connect/${availableServer}`,
  });
};
