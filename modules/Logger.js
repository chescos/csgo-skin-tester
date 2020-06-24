const winston = require('winston');
const colors = require('colors');

const { format } = winston;

const printNice = format.printf((info) => {
  const {
    timestamp, level, message, metadata,
  } = info;

  const levelColor = {
    debug: 'blue',
    info: 'green',
    warn: 'yellow',
    error: 'red',
  }[level] || 'white';

  const f = {
    timestamp: `${colors.cyan(`[${timestamp}]`)}`,
    level: `${colors[levelColor](`[${level.toUpperCase()}]`)}`,
    message: `${message}`,
    meta: '',
  };

  if (Object.keys(metadata).length !== 0) {
    f.meta = `\n${colors.magenta(JSON.stringify(metadata, null, 4))}`;
  }

  return `${f.timestamp}${f.level}: ${f.message}${f.meta}`;
});

const enumerateErrorFormat = format((info) => {
  if (info.message instanceof Error) {
    // eslint-disable-next-line no-param-reassign
    info.message = {
      message: info.message.message,
      stack: info.message.stack,
      ...info.message,
    };
  }

  if (info instanceof Error) {
    return {
      message: info.message,
      stack: info.stack,
      ...info,
    };
  }

  return info;
});

const logger = winston.createLogger({
  format: format.combine(
    enumerateErrorFormat(),
    format.timestamp({
      format: 'DD.MM.YY HH:mm:ss.SSS',
    }),
    format.metadata({
      fillExcept: ['timestamp', 'label', 'level', 'message'],
    }),
    printNice,
  ),
  transports: [
    new winston.transports.Console({
      handleExceptions: true,
      handleRejections: true,
    }),
  ],
});

module.exports = logger;
