import { AlbumIF } from '../types/albumTypes';
import { CodeMessageError } from '../types/srcApiTypes';
import * as db from '../utils/db';
import { srcFileErrorHandler } from '../utils/srcFile';

class Album implements AlbumIF {
    id: string;
    title: string;
    album_date: string;
    create_date: string;
    description: string;

    constructor(title = '', album_date = '', description = '', id = '') {
        this.id = id;
        this.title = title;
        this.album_date = album_date;
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

    getCurrentAlbum(): AlbumIF {
        return {
            id: this.id,
            title: this.title,
            album_date: this.album_date,
            create_date: this.create_date,
            description: this.description
        };
    }

    setCurrentAlbumByInfo(info: AlbumIF): void {
        this.id = info.id;
        this.title = info.title;
        this.album_date = info.album_date;
        this.create_date = info.create_date;
        this.description = info.description || '';
    }

    async getAlbumById(id: string): Promise<AlbumIF | CodeMessageError> {
        try {
            if (!id) throw { code: 400, message: 'Please provide an album id' };

            this.id = id;

            const [albumInfo] = await db.query('select id, title, album_date, create_date, description from albums, albums_descriptions where id=$1', [this.id], 'get album by id');

            this.setCurrentAlbumByInfo(albumInfo);

            return this.getCurrentAlbum();
        } catch (error) {
            return srcFileErrorHandler(error, 'Could not get album by id');
        }
    }

    async updateDescription(newDescription: string): Promise<AlbumIF | CodeMessageError> {
        try {
            if (!newDescription || !this.id) throw { code: 400, message: 'Please provide a description and an album id' };

            await db.query('insert into albums_descriptions values($1,$2) on conflict (album_id) do update set description=$2', [this.id, newDescription], 'update album description');

            this.description = newDescription;

            return await this.getAlbumById(this.id);
        } catch (error) {
            return srcFileErrorHandler(error, 'Could not update album description');
        }
    }

    async createAlbum(): Promise<AlbumIF | CodeMessageError> {
        try {
            if (!this.title || !this.album_date) throw { code: 400, message: 'Please provide a title and an album date' };

            const [newAlbum] = await db.query('insert into albums(title, album_date, create_date) values($1,$2,$3) returning id', [this.title, this.album_date, this.create_date], 'create a new album');

            this.id = newAlbum.id;

            if (this.id && this.description) return await this.updateDescription(this.description);

            return this.getCurrentAlbum();
        } catch (error) {
            return srcFileErrorHandler(error, 'Could not create album');
        }
    }

    async updateTitle(newTitle: string): Promise<AlbumIF | CodeMessageError> {
        try {
            if (!newTitle || !this.id) throw { code: 400, message: 'Please provide a title and an album id' };

            await db.query('update albums set title=$1 where id=$2', [newTitle, this.id], 'update album title');

            this.title = newTitle;

            return await this.getAlbumById(this.id);
        } catch (error) {
            return srcFileErrorHandler(error, 'Could not update album title');
        }
    }

    async updateAlbumDate(newAlbumDate: string): Promise<AlbumIF | CodeMessageError> {
        try {
            if (!newAlbumDate || !this.id) throw { code: 400, message: 'Please provide an album date and an album id' };

            await db.query('update albums set album_date=$1 where id=$2', [newAlbumDate, this.id], 'update album date');

            this.album_date = newAlbumDate;

            return await this.getAlbumById(this.id);
        } catch (error) {
            return srcFileErrorHandler(error, 'Could not update album title');
        }
    }

    async getAlbumPhotosByAlbumId(offset: string | number) {
        try {
            const allAlbumPhotos = await db.query('SELECT p.id, p.url, p.thumbnail, p.create_date, pd.description FROM photos p LEFT JOIN photos_descriptions pd ON p.id = pd.photo_id join albums_photos ap on ap.photo_id = p.id join albums a on a.id = ap.album_id where a.id = $1 limit 25 offset $2', [this.id, offset], 'get all album photos by album id');

            return allAlbumPhotos;
        } catch (error) {
            return srcFileErrorHandler(error, 'Could not get all album photos by album id');
        }
    }

    static async getAllAlbums() {
        try {
            const allPhotos = await db.query('SELECT id,title,album_date,create_date,description FROM albums LEFT JOIN albums_descriptions ON id = album_id', [], 'get all albums and their descriptions');

            return allPhotos;
        } catch (error) {
            return srcFileErrorHandler(error, 'Could not get all albums and their description');
        }
    }
}

export default Album;
