import { basename } from 'path'

import fastGlob from 'fast-glob'
import { isNotJunk } from 'junk'

import { validateDefinedString } from '../../type.js'

const normalize = function (definition) {
  if (typeof definition !== 'boolean') {
    throw new TypeError('Definition must be a boolean.')
  }

  return definition
}

const main = async function (definition, input, { cwd }) {
  if (!definition) {
    return
  }

  validateDefinedString(input)
  const filePaths = await fastGlob(input, {
    cwd,
    absolute: true,
    unique: true,
    onlyFiles: true,
  })
  const filePathsA = filePaths.filter((filePath) =>
    isNotJunk(basename(filePath)),
  )
  return { input: filePathsA }
}

// Apply `glob[(input, info)]` which resolves the input as a globbing pattern
// when `true` (default: `false`).
// Duplicates and temporary files are also removed.
// Only returns regular files, not directories.
// This is performed before `transform()` and `validate()`.
//  - This allows using `validate()` to validate parent directories, timestamps,
//    file types, etc.
// This is performed before `path` in cases both are `true`.
// eslint-disable-next-line import/no-default-export
export default {
  name: 'glob',
  hasInput: true,
  normalize,
  main,
}
