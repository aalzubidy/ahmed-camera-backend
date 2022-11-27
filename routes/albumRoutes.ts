import express, { Request, Response } from 'express';
import { srcFileRouterErrorhandler } from '../utils/srcFile';
import Album from '../src/albumSrc';

const router = express.Router();

/**
 * @summary Create a new album
 */
router.post('/album/', async (req: Request, res: Response) => {
  try {
    const { title, albumDate, description } = req.body;
    const newAlbum = new Album(title, albumDate, description);
    const data = await newAlbum.createAlbum();

    res.status(201).json({
      data
    });
  } catch (error) {
    srcFileRouterErrorhandler(error, req, res);
  }
});

/**
 * @summary Get all albums
 */
router.get('/album', async (req: Request, res: Response) => {
  try {
    const data = await Album.getAllAlbums();

    res.status(200).json({
      data
    });
  } catch (error) {
    srcFileRouterErrorhandler(error, req, res);
  }
});

/**
 * @summary Get an album by id
 */
router.get('/album/:albumId', async (req: Request, res: Response) => {
  try {
    const { albumId } = req.params;
    const newAlbum = new Album();
    const data = await newAlbum.getAlbumById(albumId);

    res.status(200).json({
      data
    });
  } catch (error) {
    srcFileRouterErrorhandler(error, req, res);
  }
});

/**
 * @summary Get an album by id
 */
router.get('/album/:albumId/photos', async (req: Request, res: Response) => {
  try {
    const { albumId } = req.params;
    const offset = (req.query.offset)?.toString() || 0;
    const newAlbum = new Album();
    newAlbum.setId(albumId);
    const data = await newAlbum.getAlbumPhotosByAlbumId(offset);

    res.status(200).json({
      data
    });
  } catch (error) {
    srcFileRouterErrorhandler(error, req, res);
  }
});

/**
 * @summary Update album title by id
 */
router.patch('/album/:albumId/title', async (req: Request, res: Response) => {
  try {
    const { albumId } = req.params;
    const { title } = req.body;
    const newAlbum = new Album();
    newAlbum.setId(albumId);
    const data = await newAlbum.updateTitle(title);

    res.status(200).json({
      data
    });
  } catch (error) {
    srcFileRouterErrorhandler(error, req, res);
  }
});

/**
 * @summary Update album date by id
 */
router.patch('/album/:albumId/albumDate', async (req: Request, res: Response) => {
  try {
    const { albumId } = req.params;
    const { albumDate } = req.body;
    const newAlbum = new Album();
    newAlbum.setId(albumId);
    const data = await newAlbum.updateAlbumDate(albumDate);

    res.status(200).json({
      data
    });
  } catch (error) {
    srcFileRouterErrorhandler(error, req, res);
  }
});

/**
 * @summary Update album description by id
 */
router.patch('/album/:albumId/description', async (req: Request, res: Response) => {
  try {
    const { albumId } = req.params;
    const { description } = req.body;
    const newAlbum = new Album();
    newAlbum.setId(albumId);
    const data = await newAlbum.updateDescription(description);

    res.status(200).json({
      data
    });
  } catch (error) {
    srcFileRouterErrorhandler(error, req, res);
  }
});

export default router;
