import { resolve, basename } from 'path'

import fastGlob from 'fast-glob'
import { isNotJunk } from 'junk'

import { callValueFunc } from './call.js'

// Apply `path(value, opts) => boolean` which resolves the value as an absolute
// file path when `true` (default: `false`).
// This is performed before `transform()` and `validate()`.
//  - This allows using `validate()` to validate file existence, parent
//    directories, timestamps, file types, etc.
export const resolvePath = async function ({
  value,
  path,
  glob,
  opts,
  opts: {
    funcOpts: { cwd },
  },
}) {
  if (!(await callValueFunc(path, value, opts))) {
    return value
  }

  await callValueFunc(checkPath, value, opts)

  return glob ? await resolveGlob(cwd, value) : resolve(cwd, value)
}

export const checkPath = function (value) {
  if (typeof value !== 'string') {
    throw new TypeError('must be a string.')
  }

  if (value.trim() === '') {
    throw new TypeError('must not be an empty string.')
  }
}

// When `glob(value, opts)` is `true` (default: `false`), resolves globbing.
// Remove duplicates and temporary files.
// Only returns regular files, not directories.
const resolveGlob = async function (cwd, value) {
  const filePaths = await fastGlob(value, { cwd, absolute: true, unique: true })
  return filePaths.filter((filePath) => isNotJunk(basename(filePath)))
}
