import { basename } from 'node:path'

import fastGlob from 'fast-glob'
import { isNotJunk } from 'junk'

import { normalizeBoolean, validateDefinedString } from '../normalize/common.js'

const main = (definition, input, { cwd }) => {
  if (!definition) {
    return
  }

  validateDefinedString(input)
  const filePaths = fastGlob.sync(input, getFastGlobOpts(cwd))
  return returnFilePaths(filePaths)
}

const mainAsync = async (definition, input, { cwd }) => {
  if (!definition) {
    return
  }

  validateDefinedString(input)
  const filePaths = await fastGlob(input, getFastGlobOpts(cwd))
  return returnFilePaths(filePaths)
}

const getFastGlobOpts = (cwd) => ({
  cwd,
  absolute: true,
  unique: true,
  onlyFiles: true,
})

const returnFilePaths = (filePaths) => {
  const input = filePaths.filter(shouldKeepFilePath)
  return { input }
}

const shouldKeepFilePath = (filePath) => isNotJunk(basename(filePath))

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
  exampleDefinition: true,
  normalize: normalizeBoolean,
  main,
  mainAsync,
}
