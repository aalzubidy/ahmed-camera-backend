import express, { Request, Response } from 'express';
import { srcFileRouterErrorhandler } from '../utils/srcFile';
import Photo from '../src/photoSrc';

const router = express.Router();

/**
 * @summary Get a photo by id
 */
router.get('/photo/:photoId', async (req: Request, res: Response) => {
    try {
        const { photoId } = req.params;
        const newPhoto = new Photo();
        const data = await newPhoto.getPhotoById(photoId);

        res.status(200).json({
            data
        });
    } catch (error) {
        srcFileRouterErrorhandler(error, req, res);
    }
});

/**
 * @summary Update photo description by id
 */
router.patch('/photo/:photoId/description', async (req: Request, res: Response) => {
    try {
        const { photoId } = req.params;
        const { description } = req.body;
        const newPhoto = new Photo();
        newPhoto.setId(photoId);
        const data = await newPhoto.updateDescription(description);

        res.status(200).json({
            data
        });
    } catch (error) {
        srcFileRouterErrorhandler(error, req, res);
    }
});

/**
 * @summary Add a photo to an album
 */
router.put('/photo/:photoId/album/:albumId', async (req: Request, res: Response) => {
    try {
        const { photoId, albumId } = req.params;
        const newPhoto = new Photo();
        newPhoto.setId(photoId);
        const data = await newPhoto.addPhotoToAlbum(albumId);

        res.status(200).json({
            data
        });
    } catch (error) {
        srcFileRouterErrorhandler(error, req, res);
    }
});

/**
 * @summary Remove a photo to an album
 */
router.delete('/photo/:photoId/album/:albumId', async (req: Request, res: Response) => {
    try {
        const { photoId, albumId } = req.params;
        const newPhoto = new Photo();
        newPhoto.setId(photoId);
        const data = await newPhoto.removePhotoToAlbum(albumId);

        res.status(200).json({
            data
        });
    } catch (error) {
        srcFileRouterErrorhandler(error, req, res);
    }
});

export default router;
