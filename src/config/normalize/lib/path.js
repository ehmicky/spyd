import { resolve, basename } from 'path'

import fastGlob from 'fast-glob'
import { isNotJunk } from 'junk'

import { callValueFunc, callValidateFunc } from './call.js'

// Apply `path(value, opts) => boolean` which resolves the value as an absolute
// file path when `true` (default: `false`).
// This is performed before `transform()` and `validate()`.
//  - This allows using `validate()` to validate file existence, parent
//    directories, timestamps, file types, etc.
// A `cwd(value, opts)` can be specified to customize the `cwd`.
//  - The default value is `.`, not some `process.cwd()` evaluated at load time,
//    to ensure it is evaluated at runtime.
// An empty `cwd` is same as `.`
export const resolvePath = async function (value, { path, cwd, glob, opts }) {
  if (value === undefined || !(await callValueFunc(path, value, opts))) {
    return value
  }

  await callValidateFunc(validatePath, value, opts)
  const cwdA = await callValueFunc(cwd, value, opts)
  return glob ? await resolveGlob(cwdA, value) : resolve(cwdA, value)
}

const validatePath = function (value) {
  if (typeof value !== 'string') {
    throw new TypeError('must be a string.')
  }

  if (value.trim() === '') {
    throw new TypeError('must not be an empty string.')
  }
}

// When `glob(value, opts)` is `true` (default: `false`), resolves globbing.
// Remove duplicates and temporary files.
const resolveGlob = async function (cwd, value) {
  const filePaths = await fastGlob(value, { cwd, absolute: true, unique: true })
  return filePaths.filter((filePath) => isNotJunk(basename(filePath)))
}
