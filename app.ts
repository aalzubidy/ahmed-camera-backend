/* eslint-disable import/first */
// Import dotenv
import dotenv from 'dotenv';
dotenv.config();

// Import SuperTokens
// SuperTokens
import { verifySession } from 'supertokens-node/recipe/session/framework/express';
import supertokens from 'supertokens-node';
import Session from 'supertokens-node/recipe/session';
import EmailPassword from 'supertokens-node/recipe/emailpassword';
import { middleware as stMiddleware, errorHandler as stErrorHandler } from 'supertokens-node/framework/express';

// Import modules
import express, { Express } from 'express';
import methodOverride from 'method-override';
import expressSanitizer from 'express-sanitized';
import path from 'path';
import multer from 'multer';
// import fs from 'fs';
import cors from 'cors';
import requestIp from 'request-ip';
import cookieParser from 'cookie-parser';
import { logger } from './utils/logger';
import { routesLogger } from './utils/routesLogger';

// Import routes
import systemRoutes from './routes/systemRoutes';
import albumRoutes from './routes/albumRoutes';
import photoRoutes from './routes/photoRoutes';
/* eslint-enable  import/first */

// SuperTokens Setup
supertokens.init({
    framework: 'express',
    supertokens: {
        // These are the connection details of the app you created on supertokens.com
        connectionURI: process.env.AHMED_CAMERA_BACKEND_ST_CONNECTION_URI || '',
        apiKey: process.env.AHMED_CAMERA_BACKEND_ST_API_KEY,
    },
    appInfo: {
        // learn more about this on https://supertokens.com/docs/session/appinfo
        appName: 'ahmed-camera',
        apiDomain: process.env.AHMED_CAMERA_BACKEND_SERVER_URI || '',
        websiteDomain: process.env.AHMED_CAMERA_BACKEND_FRONTEND_URI || '',
        apiBasePath: '/auth',
        websiteBasePath: '/auth',
    },
    recipeList: [
        EmailPassword.init({
            signUpFeature: {
                formFields: [{
                    id: 'name'
                }]
            },
            override: {
                apis: (originalImplementation) => ({
                    ...originalImplementation,
                    signUpPOST: async (input) => {
                        // await supertokens.deleteUser('2c0e2633-92a9-4105-a9e4-3bd3b3a9157d');

                        if (originalImplementation.signUpPOST === undefined) {
                            throw Error('Should never come here');
                        }

                        // First we call the original implementation of signUpPOST.
                        const response = await originalImplementation.signUpPOST(input);

                        // Post sign up response, we check if it was successful
                        if (response.status === 'OK') {
                            const { id } = response.user;

                            // // These are the input form fields values that the user used while signing up
                            const { formFields } = input;

                            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                            // @ts-ignore
                            await signUpHandler(id, formFields);

                            // await supertokens.deleteUser(id);
                        }
                        return response;
                    },
                    signInPOST: async (input) => {
                        if (originalImplementation.signInPOST === undefined) {
                            throw Error('Should never come here');
                        }

                        // First we call the original implementation of signInPOST.
                        const response = await originalImplementation.signInPOST(input);

                        // Post sign up response, we check if it was successful
                        if (response.status === 'OK') {
                            const { id } = response.user;

                            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                            // @ts-ignore
                            await signInHandler(id);
                        }
                        return response;
                    }
                })
            }
        }), // initializes signin / sign up features
        Session.init() // initializes session features
    ]
});

// Application Setup
const app: Express = express();
const serverPort = process.env.AHMED_CAMERA_BACKEND_SERVER_PORT ? parseInt(process.env.AHMED_CAMERA_BACKEND_SERVER_PORT, 10) : 3030;
const serverUrl = process.env.AHMED_CAMERA_BACKEND_SERVER_URL || 'localhost';

// App configurations
app.use(cors({ credentials: true, origin: process.env.AHMED_CAMERA_BACKEND_FRONTEND_URI, allowedHeaders: ['content-type', ...supertokens.getAllCORSHeaders()] }));
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.urlencoded({
    extended: true
}));
app.use(expressSanitizer());
app.use(methodOverride('_method'));
app.use(express.json());
app.use(requestIp.mw());
app.use(cookieParser());
app.use(routesLogger);
app.use(stMiddleware());

// Multer Configurations to upload file
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './uploads');
    },
    filename: (req, file, cb) => {
        cb(null, 'file.txt');
    }
});

const upload = multer({
    storage: storage,
    fileFilter: (req, file, callback) => {
        const ext = path.extname(file.originalname);
        if (ext !== '.txt') {
            return callback(new Error('Only text files are allowed'));
        }
        return callback(null, true);
    }
}).single('txtFile');

// Routes

// Index Route
app.get('/', async (req, res) => {
    res.render('index');
});

// Get session's user id
app.get('/auth/sessionUserId', verifySession(), async (req, res) => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const userId = req.session?.getUserId();
    res.send({
        userId
    });
});

// System and stats routes
app.use(systemRoutes);

// Album routes
app.use(albumRoutes);

// Photo routes
app.use(photoRoutes);

// Upload a new file
app.post('/uploadFile', (req, res) => {
    upload(req, res, (err) => {
        if (err) {
            const errMsg = `Could not upload text file ${JSON.stringify(err)} ${err}`;
            logger.error(errMsg);
            res.send(errMsg);
        } else {
            logger.debug('File uploaded successfully!');
            res.send('File uploaded successfully!');
        }
    });
});

// Not Found Route
app.get('*', (req, res) => {
    res.render('notFound');
});

// Add this AFTER all your routes
app.use(stErrorHandler());

// Start server on specified url and port
app.listen(serverPort, serverUrl, () => {
    logger.info('Application started successfully...');
    logger.debug(`Server can be accessed on http://${serverUrl}:${serverPort}`);
});

process.on('unhandledRejection', (reason, promise) => {
    logger.error(reason);
    logger.error(promise);
});

process.on('uncaughtException', (reason) => {
    logger.error(reason);
});
