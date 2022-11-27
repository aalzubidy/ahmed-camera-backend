import { AlbumPhotoIF, PhotoIF } from '../types/photoTypes';
import { CodeMessageError } from '../types/srcApiTypes';
import * as db from '../utils/db';
import { srcFileErrorHandler } from '../utils/srcFile';

class Photo implements PhotoIF {
    id: string;
    url: string;
    thumbnail: string;
    create_date: string;
    description: string;

    constructor(url = '', thumbnail = '', description = '', id = '') {
        this.id = id;
        this.url = url;
        this.thumbnail = thumbnail;
        this.create_date = new Date().toISOString();
        this.description = description;
    }

    setId(id: string): void | CodeMessageError {
        if (id) this.id = id;
        else throw ({ code: 500, message: 'please provide an id' });
    }

    getId(): string {
        return this.id;
    }

    getCurrentPhoto(): PhotoIF {
        return {
            id: this.id,
            url: this.url,
            thumbnail: this.thumbnail,
            create_date: this.create_date,
            description: this.description
        };
    }

    setCurrentPhotoByInfo(info: PhotoIF): void {
        this.id = info.id;
        this.url = info.url;
        this.thumbnail = info.thumbnail;
        this.create_date = info.create_date;
        this.description = info.description || '';
    }

    async getPhotoById(id: string): Promise<PhotoIF | CodeMessageError> {
        try {
            if (!id) throw { code: 400, message: 'Please provide a photo id' };

            this.id = id;

            const [photoInfo] = await db.query('select id, url, thumbnail, create_date, description from photos, photos_descriptions where id=$1', [this.id], 'get photo by id');

            this.setCurrentPhotoByInfo(photoInfo);

            return this.getCurrentPhoto();
        } catch (error) {
            return srcFileErrorHandler(error, 'Could not get photo by id');
        }
    }

    async updateDescription(newDescription: string): Promise<PhotoIF | CodeMessageError> {
        try {
            if (!newDescription || !this.id) throw { code: 400, message: 'Please provide a description and a photo id' };

            await db.query('insert into photos_descriptions values($1,$2) on conflict (photo_id) do update set description=$2', [this.id, newDescription], 'update photo description');

            this.description = newDescription;

            return await this.getPhotoById(this.id);
        } catch (error) {
            return srcFileErrorHandler(error, 'Could not update photo description');
        }
    }

    async createPhoto(): Promise<PhotoIF | CodeMessageError> {
        try {
            const [newPhoto] = await db.query('insert into photos(url, thumbnail, create_date) values($1,$2,$3) returning id', [this.url, this.thumbnail, this.create_date], 'create a new photo');

            this.id = newPhoto.id;

            if (this.id && this.description) return await this.updateDescription(this.description);

            return this.getCurrentPhoto();
        } catch (error) {
            return srcFileErrorHandler(error, 'Could not create photo');
        }
    }

    async updateUrl(newUrl: string): Promise<PhotoIF | CodeMessageError> {
        try {
            if (!newUrl || !this.id) throw { code: 400, message: 'Please provide a url and a photo id' };

            await db.query('update photos set url=$1 where id=$2', [newUrl, this.id], 'update photo title');

            this.url = newUrl;

            return await this.getPhotoById(this.id);
        } catch (error) {
            return srcFileErrorHandler(error, 'Could not update photo url');
        }
    }

    async updateThumbnail(newThumbnail: string): Promise<PhotoIF | CodeMessageError> {
        try {
            if (!newThumbnail || !this.id) throw { code: 400, message: 'Please provide a thumbnail and a photo id' };

            await db.query('update photos set thumbnail=$1 where id=$2', [newThumbnail, this.id], 'update photo thumbnail');

            this.url = newThumbnail;

            return await this.getPhotoById(this.id);
        } catch (error) {
            return srcFileErrorHandler(error, 'Could not update photo thumbnail');
        }
    }

    async addPhotoToAlbum(albumId: string): Promise<AlbumPhotoIF | CodeMessageError> {
        try {
            await db.query('insert into albums_photos values($1,$2)', [albumId, this.id], 'add a photo to album');

            return {
                album_id: albumId,
                photo_id: this.id
            };
        } catch (error) {
            return srcFileErrorHandler(error, 'Could not add photo to album');
        }
    }

    async removePhotoToAlbum(albumId: string): Promise<AlbumPhotoIF | CodeMessageError> {
        try {
            await db.query('delete from albums_photos where album_id=$1 and photo_id=$2', [albumId, this.id], 'remove a photo to album');

            return {
                album_id: albumId,
                photo_id: this.id
            };
        } catch (error) {
            return srcFileErrorHandler(error, 'Could not remove photo to album');
        }
    }

    static async getAllPhotos() {
        try {
            const allPhotos = await db.query('SELECT p.id, p.url, p.thumbnail, p.create_date, pd.description FROM photos p LEFT JOIN photos_descriptions pd ON p.id = pd.photo_id', [], 'get all photos and their descriptions');

            return allPhotos;
        } catch (error) {
            return srcFileErrorHandler(error, 'Could not get all photos and their description');
        }
    }
}

export default Photo;
