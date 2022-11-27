import path from 'path';
import multer from 'multer';
import fs from 'fs';
import * as uuid from 'uuid';
import { Request, Response } from 'express';
import sharp from 'sharp';
import { logger } from './logger';
import { srcFileErrorHandler } from './srcFile';

const storagePath = './public/photos';

// Configure upload to local server
const storageLocalAvatar = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, storagePath);
    },
    filename: (req, file, cb) => {
        cb(null, `${uuid.v4()}-${Date.now()}${path.extname(file.originalname)}`);
    }
});

const uploadLocalPhoto = multer({
    storage: storageLocalAvatar,
    limits: {
        fileSize: 15 * 1024 * 1024, // no larger than 15mb
    },
    fileFilter: (req, file, callback) => {
        try {
            const ext = path.extname(file.originalname);
            if (ext !== '.png' && ext !== '.jpg' && ext !== '.jpeg' && ext !== '.gif') throw { code: 400, message: 'Unsupported file type, only photos are allowed' };
            logger.debug('Filtered file - format okay');
            callback(null, true);
        } catch (error: any) {
            const userMsg = error.message || 'Could not filter photo';
            logger.error(error);
            callback(userMsg);
        }
    }
}).array('photos');

/**
 * @function uploadPhotoLocal
 * @summary Upload a picture to photos or to thumbnails
 * @param {object} req - Http request
 * @param {object} res - Http response
 * @returns {object} uploadAvataresults
 * @throws {object} errorCodeAndMsg
 */
const uploadPhotoLocal = function uploadPhotoLocal(req: Request, res: Response) {
    return new Promise((resolve, reject) => {
        // Upload picture
        uploadLocalPhoto(req, res, (err) => {
            if (err) {
                reject(err);
            } else {
                const imagePaths: string[] = [];
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                req.files.forEach((file: any) => {
                    imagePaths.push(file.path.replace('public/', '/'));
                });

                logger.debug({ message: 'Uploaded pictures successfully', results: imagePaths });
                resolve({ message: 'Uploaded pictures successfully', imagePaths, req });
            }
        });
    });
};

/**
 * @function deletePhotosLocal
 * @summary Delete photos by their url
 * @param {array} fileUrls - Files' urls
 * @returns {object} deleteAvatarResults
 * @throws {boolean} false
 */
const deletePhotosLocal = function deletePhotosLocal(fileUrls: string[]) {
    try {
        // Check if there is no file url
        if (!fileUrls || fileUrls.length <= 0) throw { code: 400, message: 'Please provide file urls' };

        fileUrls.forEach((fileUrl) => {
            // Delete the photo
            fs.unlinkSync(`${path.resolve(__dirname, '../public')}${fileUrl}`);

            // Delete the low resolution of it too
            const lowResPath = `${path.resolve(__dirname, '../public')}${fileUrl}`.replace('/photos/', '/photos/thumbnails/');
            fs.unlinkSync(lowResPath);
        });

        return { message: 'Deleted files by their url successfully' };
    } catch (error) {
        return srcFileErrorHandler(error, 'Could not delete file by its url');
    }
};

/**
 * @function generateLowResImages
 * @summary Generate low resolution images
 * @param {array} imagePaths - Images paths
 * @returns {object} lowResPaths
 * @throws {boolean} false
 */
const generateLowResImages = async function generateLowResImages(imagePaths: string[]) {
    try {
        imagePaths.forEach(async (imgPath) => {
            const newPath = `${path.resolve(__dirname, '../public')}${imgPath}`.replace('/photos/', '/photos/thumbnails/');
            await sharp(`${path.resolve(__dirname, '../public')}${imgPath}`).resize(1024).jpeg({ mozjpeg: true }).toFile(newPath);
        });
    } catch (error) {
        srcFileErrorHandler(error, 'Could not generate low resolution images');
    }
};

export {
    uploadPhotoLocal,
    deletePhotosLocal,
    generateLowResImages
};
