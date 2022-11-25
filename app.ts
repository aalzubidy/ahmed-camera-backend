/* eslint-disable import/first */
// Import dotenv
import dotenv from 'dotenv';
dotenv.config();

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
/* eslint-enable  import/first */

// Application Setup
const app: Express = express();
const serverPort = 3030;
const serverUrl = 'localhost';

// App configurations
app.use(cors({ credentials: true, origin: 'http://localhost:3000' }));
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

// System and stats routes
app.use(systemRoutes);

// Album routes
app.use(albumRoutes);

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
