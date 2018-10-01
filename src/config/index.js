const winston = require('winston');

const env = process.env.WT_CONFIG || 'dev';

const config = Object.assign({
  port: 8935,
  baseUrl: process.env.WT_API_BASE_URL || 'http://localhost:8935',
  logger: winston.createLogger({
    level: 'info',
    transports: [
      new winston.transports.Console({
        format: winston.format.simple(),
        stderrLevels: ['error'],
      }),
    ],
  }),
}, require(`./${env}`));

if (!config.hotelId) {
  throw new Error('No hotelId specified!');
}
config.hotelId = config.hotelId.toLowerCase();

module.exports = config;