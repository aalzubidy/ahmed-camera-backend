import { Request } from 'express';
import { logger } from './logger';

/**
 * @function routesLogger
 * @summary Log http requests
 * @param {*} req - Http request
 * @returns request
 */
const routesLogger = function routesLogger(req: Request) {
  try {
    logger.debug({ method: req.method.trim(), url: req.url.trim(), body: req.body });
    return req.next ? req.next() : req;
  } catch (error) {
    return req.next ? req.next() : req;
  }
};

export {
  routesLogger
};
