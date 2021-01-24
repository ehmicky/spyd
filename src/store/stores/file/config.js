import { resolve } from 'path'

// The `store.file.dir` configuration property specifies where the directory
// where to save data.
export const getDir = function ({ cwd, dir = DEFAULT_DIR }) {
  return resolve(cwd, dir)
}

const DEFAULT_DIR = 'benchmark'
