import { resolve } from 'path'

import { callValueFunc } from '../call.js'
import { validateDefinedString } from '../type.js'

import { validateAccess } from './access.js'
import { checkKeywords } from './check.js'
import { fileExists, validateExists } from './exist.js'
import { validateType } from './type.js'

// Apply `path[(value, opts)]` which resolves the value as an absolute file path
// unless `undefined`.
// It is an array of strings performing additional validation:
//  - "exist": file exists
//  - "file", "directory": regular file, directory, or both
//  - "read", "write", "execute": readable|writable|executable permissions
// This is performed before `transform()` and `validate()`.
//  - This allows using `validate()` to validate file existence, parent
//    directories, timestamps, file types, etc.
export const resolvePath = async function (value, path, opts) {
  const keywords = await callValueFunc(path, value, opts)

  if (keywords === undefined) {
    return value
  }

  await callValueFunc(validateDefinedString, value, opts)
  const valueA = resolve(opts.funcOpts.cwd, value)
  const keywordsA = checkKeywords(keywords)
  await callValueFunc(
    validateFile.bind(undefined, valueA, keywordsA),
    value,
    opts,
  )
  return valueA
}

const validateFile = async function (value, keywords) {
  if (!(await fileExists(value))) {
    validateExists(keywords)
    return
  }

  await validateType(value, keywords)
  await validateAccess(value, keywords)
}
