const isTmdbPath = (path) => !path.startsWith('http://') && !path.startsWith('https://')
export const posterUrl = (path, size = 'w500') => isTmdbPath(path) ? `https://image.tmdb.org/t/p/${size}${path}` : path
export const backdropUrl = (path, size = 'w1280') => isTmdbPath(path) ? `https://image.tmdb.org/t/p/${size}${path}` : path
export const profileUrl = (path, size = 'w45') => path && isTmdbPath(path) ? `https://image.tmdb.org/t/p/${size}${path}` : path
