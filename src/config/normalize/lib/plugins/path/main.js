import { resolve } from 'path'

import { validateDefinedString } from '../../type.js'

import { validateAccess } from './access.js'
import { checkKeywords } from './check.js'
import { fileExists, validateExists } from './exist.js'
import { validateType } from './type.js'

export const name = 'path'

export const input = true

// Apply `path[(value, opts)]` which resolves the value as an absolute file
// path.
// It is an array of strings performing additional validation:
//  - "exist": file exists
//  - "file", "directory": regular file, directory, or both
//  - "read", "write", "execute": readable|writable|executable permissions
// This is performed before `transform()` and `validate()`.
//  - This allows using `validate()` to validate file existence, parent
//    directories, timestamps, file types, etc.
export const main = async function (keywords, value, { cwd }) {
  validateDefinedString(value)
  const valueA = resolve(cwd, value)
  const keywordsA = checkKeywords(keywords)
  await validateFile(valueA, keywordsA)
  return { value: valueA }
}

const validateFile = async function (value, keywords) {
  if (!(await fileExists(value))) {
    validateExists(keywords)
    return
  }

  await validateType(value, keywords)
  await validateAccess(value, keywords)
}
