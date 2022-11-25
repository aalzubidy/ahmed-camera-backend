interface CodeMessageError {
    code: number,
    message: string,
    [extraKeys?: string | number | symbol]: unknown
}

interface AlbumIF {
    id: string,
    title: string,
    album_date: string,
    create_date: string,
    description?: string
}
