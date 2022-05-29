import { basename } from 'path'

import fastGlob from 'fast-glob'
import { isNotJunk } from 'junk'

import { create, call } from '../../../../../utils/async_sync.js'
import { validateDefinedString, normalizeBoolean } from '../normalize/common.js'

// eslint-disable-next-line max-params
const mainSyncAsync = function (sync, definition, input, { cwd }) {
  if (!definition) {
    return
  }

  validateDefinedString(input)
  return call(
    sync,
    fastGlob.sync,
    fastGlob,
    [input, { cwd, absolute: true, unique: true, onlyFiles: true }],
    returnFilePaths,
  )
}

const returnFilePaths = function (filePaths) {
  const input = filePaths.filter(shouldKeepFilePath)
  return { input }
}

const shouldKeepFilePath = function (filePath) {
  return isNotJunk(basename(filePath))
}

const [main, mainAsync] = create(mainSyncAsync)

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
