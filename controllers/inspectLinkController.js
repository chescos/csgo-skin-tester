const Inspector = require('../modules/Inspector');
const ErrorResponse = require('../modules/ErrorResponse');
const logger = require('../modules/Logger');

exports.store = async (req, res) => {
  const {
    body: { link },
  } = req;

  let inspection;

  try {
    inspection = await Inspector.inspect(link, 10000);

    logger.info('Inspected link', inspection);
  } catch (error) {
    logger.warn('Inspection failed', { link });
    logger.error(error);

    return res.status(500).json(ErrorResponse.inspectionFailed());
  }

  return res.status(201).json({
    success: true,
    inspection,
  });
};
