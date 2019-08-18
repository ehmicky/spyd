import { resolve } from 'path'

// The `store.file.dir` option specifies where the directory where to save data.
export const getDir = function({ packageRoot, dir = DEFAULT_DIR }) {
  return resolve(packageRoot, dir)
}

const DEFAULT_DIR = 'spyd'
