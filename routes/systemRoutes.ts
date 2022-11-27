import express, { Request, Response } from 'express';
// import { verifySession } from 'supertokens-node/recipe/session/framework/express';
import { callSrcFileSkipVerify } from '../utils/srcFile';
import * as systemSrc from '../src/systemSrc';

const router = express.Router();

/**
 * @summary Get system version
 */
router.get('/system/version', async (req: Request, res: Response) => {
  callSrcFileSkipVerify(systemSrc, 'getSystemVersion', [], req, res);
});

/**
 * @summary Get system ping
 */
router.get('/system/ping', async (req: Request, res: Response) => {
  callSrcFileSkipVerify(systemSrc, 'systemPing', [], req, res);
});

export default router;
