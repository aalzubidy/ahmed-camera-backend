import * as db from '../utils/db';
import { srcFileErrorHandler } from '../utils/srcFile';

class Album implements AlbumIF {
    id: string;
    title: string;
    album_date: string;
    create_date: string;
    description: string;

    constructor(id = '', title = '', album_date = '', description = '') {
        this.id = id;
        this.title = title;
        this.album_date = album_date;
        this.create_date = new Date().toISOString();
        this.description = description;
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

    async updateDescription(): Promise<AlbumIF | CodeMessageError> {
        try {
            if (!this.description || !this.id) throw { code: 400, message: 'Please provide a description and an album id' };

            const [newAlbumDescription] = await db.query('insert into albums_descriptions values($1,$2) on conflict (album_id) do update set description=$2', [this.id, this.description], 'update album description');

            this.description = newAlbumDescription.description;

            return this.getCurrentAlbum();
        } catch (error) {
            return srcFileErrorHandler(error, 'Could not update album description');
        }
    }

    async createAlbum(): Promise<AlbumIF | CodeMessageError> {
        try {
            if (!this.title || !this.album_date) throw { code: 400, message: 'Please provide a title and an album date' };

            const [newAlbum] = await db.query('insert into albums(title, album_date, create_date) values($1,$2,$3)', [this.title, this.album_date, this.create_date], 'create a new album');

            this.id = newAlbum.id;

            if (this.id && this.description) return await this.updateDescription();

            return this.getCurrentAlbum();
        } catch (error) {
            return srcFileErrorHandler(error, 'Could not create album');
        }
    }
}

export default Album;
