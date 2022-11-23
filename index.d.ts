interface CodeMessageError {
    code: number,
    message: string,
    [extraKeys?: string | number | symbol]: unknown
}
