import * as winston from 'winston';
import { Logger } from 'winston';

const { combine, timestamp, label, printf } = winston.format;

const myFormat = printf(({level, message, label, timestamp}) => {
  return `${timestamp} [${label}] ${level}: ${message}`;
});
export const level = 'debug';
const loggers = {};

function addLabeledLogger(s: string): Logger {
  loggers[s] = true;
  return winston.loggers.add(s, {
    level: level,
    format: combine(
      label({label: s}),
      timestamp(),
      myFormat
    ),
    transports: [
      new winston.transports.Console(),
      new winston.transports.File({filename: 'error.log', level: 'error'}),
      new winston.transports.File({filename: 'combined.log'})
    ]
  });
}

export function getLogger(s?) {
  s = s || 'default';
  if (loggers[s] !== true) return addLabeledLogger(s);
  return winston.loggers.get(s);
}
