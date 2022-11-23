// Import modules
import fs from 'fs';
import pino, { StreamEntry } from 'pino';

// Set default log level for file and console transports
const logFileLevel = process.env.AHMED_CAMERA_BACKEND_LOG_FILE_LEVEL || 'info';
const logConsoleLevel = process.env.AHMED_CAMERA_BACKEND_LOG_CONSOLE_LEVEL || 'debug';

// Set log file path
const logFilePath = process.env.AHMED_CAMERA_BACKEND_LOG_FILE_PATH || './ahmed-camera-backend.log';

// Set streams
const streams: StreamEntry[] = [
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  { stream: process.stdout, level: logConsoleLevel },
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  { stream: fs.createWriteStream(logFilePath, { flags: 'a' }), level: logFileLevel, streamOpt: { sync: false } },
];

// Export logger with options
const logger = pino({
  name: 'Ahmed-Camera-Backend',
  level: 'debug',
  timestamp: (): string => `,"time":"${new Date(Date.now()).toISOString()}"`,
  formatters: {
    bindings: (bindings) => ({ name: bindings.name }),
    level: (label) => ({ level: label }),
  }
}, pino.multistream(streams));

export {
  logger
};
