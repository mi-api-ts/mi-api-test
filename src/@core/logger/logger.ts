import { env } from '@core/config/envConfig';
import winston from 'winston';

const enumerateErrorFormat = winston.format((info) => {
  if (info instanceof Error) {
    Object.assign(info, { message: info.stack });
  }
  return info;
});

const logger = winston.createLogger({
  level: env.isProduction === false ? 'debug' : 'info',
  format: winston.format.combine(
    enumerateErrorFormat(),
    env.isProduction === false ? winston.format.colorize() : winston.format.uncolorize(),
    winston.format.splat(),
    winston.format.printf((info) => `${info.level}: ${info.message}`)
  ),
  transports: [
    new winston.transports.Console({
      stderrLevels: ['error'],
    }),
  ],
});

export default logger;
