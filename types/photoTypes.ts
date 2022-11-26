interface PhotoIF {
    id: string,
    url: string,
    thumbnail: string,
    create_date: string,
    description?: string,
    tags?: string[];
}

interface AlbumPhotoIF {
    album_id: string,
    photo_id: string
}

export {
    PhotoIF,
    AlbumPhotoIF
};
