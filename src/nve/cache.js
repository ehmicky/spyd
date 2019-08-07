import findCacheDir from 'find-cache-dir'

export const CACHE_DIR = findCacheDir({ name: 'nve', create: true })
