const Inspector = require('../modules/Inspector');
const ErrorResponse = require('../modules/ErrorResponse');
const logger = require('../modules/Logger');
const gameServer = require('../modules/GameServer');
const Skin = require('../database/models/Skin');

exports.store = async (req, res) => {
  const {
    body: {
      link,
      ip,
    },
  } = req;

  let inspection;

  try {
    inspection = await Inspector.inspect(link, 5000);

    logger.info('Inspected link', inspection);
  } catch (error) {
    logger.warn('Inspection failed', { link });
    logger.error(error);

    return res.status(500).json(ErrorResponse.inspectionFailed());
  }

  if (inspection.defindex === null || inspection.paintindex === null) {
    return res.status(400).json(ErrorResponse.unsupportedSkin());
  }

  const skin = await Skin.query()
    .whereExists(
      Skin.relatedQuery('item')
        .where('defindex', inspection.defindex),
    )
    .whereExists(
      Skin.relatedQuery('paintkit')
        .where('defindex', inspection.paintindex),
    )
    .withGraphFetched({
      item: true,
      paintkit: true,
    })
    .first();

  if (!skin) {
    return res.status(400).json(ErrorResponse.unsupportedSkin());
  }

  const data = {
    ip_address: ip || req.ip,
    paintkit_name: skin.paintkit.name,
    paintkit_defindex: skin.paintkit.defindex,
    item_name: skin.item.name,
    item_defindex: skin.item.defindex,
    item_class: skin.item.class,
    item_name_technical: skin.item.name_technical,
    item_type: skin.item.type,
    wear: inspection.paintwear,
    seed: inspection.paintseed,
  };

  gameServer.sendSkin(data);

  const isPlayerConnected = gameServer.isPlayerConnected(ip);
  const availableServer = gameServer.getAvailableServer();

  return res.status(201).json({
    success: true,
    needs_to_connect: !isPlayerConnected,
    connect_to_server: isPlayerConnected ? null : availableServer,
  });
};
