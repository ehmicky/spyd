import { resolve } from 'path'

// The `store.file.dir` option specifies where the directory where to save data.
export const getDir = function ({ root, dir = DEFAULT_DIR }) {
  return resolve(root, dir)
}

const DEFAULT_DIR = 'spyd'
