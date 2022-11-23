import { StatusCodes } from 'http-status-codes';
import multer from 'multer';
import path from 'path';
import { Request, Response } from 'express';
import { logger } from './logger';

/**
 * @function isHttpCode
 * @summary Check if a code is an http code
 * @params {*} errorCode - Code to check
 * @returns {boolean} httpErroCodeResults
 */
const isHttpCode = function isHttpCode(errorCode: string | number): boolean {
  try {
    return Object.keys(StatusCodes).some((sCode) => sCode == errorCode);
  } catch (error) {
    return false;
  }
};

// Multer configruations to parse request and upload file in memory
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // no larger than 5mb
  },
  fileFilter: (req, file, callback) => {
    try {
      const ext = path.extname(file.originalname);
      if (ext !== '.png') throw { code: 400, message: 'Unsupported file type, only zip files are allowed' };
      logger.debug({ label: 'Filtered file - format okay' });
      callback(null, true);
    } catch (error: any) {
      if (error.code && isHttpCode(error.code)) {
        logger.error(error);
        callback(error);
      }
      const userMsg = 'Could not filter file';
      logger.error({ userMsg, error });
      callback(error({ code: 500, message: userMsg }));
    }
  }
}).single('file');

/**
 * @function parseFormDataWithFile
 * @summary Parse form data from http request
 * @param {object} req Http request
 * @returns {object} reqParsed
 * @throws {object} errorDetails
 */
const parseFormDataWithFile = function parseFormDataWithFile(req: Request, res: Response) {
  return new Promise((resolve, reject) => {
    upload(req, res, (err) => {
      if (err) reject(err);
      resolve(req);
    });
  });
};

export {
  isHttpCode,
  parseFormDataWithFile
};
