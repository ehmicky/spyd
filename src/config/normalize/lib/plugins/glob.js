import { basename } from 'path'

import fastGlob from 'fast-glob'
import { isNotJunk } from 'junk'

import { validateDefinedString } from '../type.js'

export const name = 'glob'

export const input = true

// Apply `glob[(value, opts)]` which resolves the value as a globbing pattern
// when `true` (default: `false`).
// Duplicates and temporary files are also removed.
// Only returns regular files, not directories.
// This is performed before `transform()` and `validate()`.
//  - This allows using `validate()` to validate parent directories, timestamps,
//    file types, etc.
// This is performed before `path` in cases both are `true`.
export const main = async function (definition, value, { cwd }) {
  if (!definition) {
    return
  }

  validateDefinedString(value)
  const filePaths = await fastGlob(value, {
    cwd,
    absolute: true,
    unique: true,
    onlyFiles: true,
  })
  const filePathsA = filePaths.filter((filePath) =>
    isNotJunk(basename(filePath)),
  )
  return { value: filePathsA }
}
