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
}

export default Album;
