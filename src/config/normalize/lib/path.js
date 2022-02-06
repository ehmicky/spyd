import { resolve, basename } from 'path'

import fastGlob from 'fast-glob'
import { isNotJunk } from 'junk'

import { callValueFunc, callUserFunc } from './call.js'

// A `cwd(opts)` option can be specified to customize the `cwd`.
//  - The default value is `.`, not some `process.cwd()` evaluated at load time,
//    to ensure it is evaluated at runtime.
export const addCwd = async function ({ cwd = DEFAULT_CWD, opts }) {
  const cwdA = await callUserFunc(cwd, opts)
  await validatePath(cwdA, opts)
  return { ...opts, cwd: cwdA }
}

const DEFAULT_CWD = '.'

// Apply `path(value, opts) => boolean` which resolves the value as an absolute
// file path when `true` (default: `false`).
// This is performed before `transform()` and `validate()`.
//  - This allows using `validate()` to validate file existence, parent
//    directories, timestamps, file types, etc.
export const resolvePath = async function (
  value,
  { path, glob, opts, opts: { cwd } },
) {
  if (!(await callValueFunc(path, value, opts))) {
    return value
  }

  await validatePath(value, opts)

  return glob ? await resolveGlob(cwd, value) : resolve(cwd, value)
}

export const validatePath = async function (value, opts) {
  await callValueFunc(checkPath, value, opts)
}

const checkPath = function (value) {
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
