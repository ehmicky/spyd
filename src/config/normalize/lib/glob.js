import { basename } from 'path'

import fastGlob from 'fast-glob'
import { isNotJunk } from 'junk'

import { validateDefinedString } from '../validate/type.js'

import { callValueFunc } from './call.js'

// Apply `glob[(value, opts)]` which resolves the value as a globbing pattern
// when `true` (default: `false`).
// Duplicates and temporary files are also removed.
// Only returns regular files, not directories.
// This is performed before `transform()` and `validate()`.
//  - This allows using `validate()` to validate parent directories, timestamps,
//    file types, etc.
// This is performed before `path` in cases both are `true`.
export const resolveGlob = async function (value, glob, opts) {
  if (!(await callValueFunc(glob, value, opts))) {
    return value
  }

  await callValueFunc(validateDefinedString, value, opts)
  const filePaths = await fastGlob(value, {
    cwd: opts.funcOpts.cwd,
    absolute: true,
    unique: true,
  })
  return filePaths.filter((filePath) => isNotJunk(basename(filePath)))
}
