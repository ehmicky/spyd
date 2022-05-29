import { resolve } from 'path'

import { validateDefinedString } from '../../../type.js'

import { validateAccess } from './access.js'
import { fileExists, validateExists } from './exist.js'
import { normalize } from './normalize.js'
import { validateType } from './type.js'

const main = async function (keywords, input, { cwd }) {
  validateDefinedString(input)
  const inputA = resolve(cwd, input)
  await validateFile(inputA, keywords)
  return { input: inputA }
}

const validateFile = async function (input, keywords) {
  if (!(await fileExists(input))) {
    validateExists(keywords)
    return
  }

  await validateType(input, keywords)
  await validateAccess(input, keywords)
}

// Apply `path[(input, info)]` which resolves the input as an absolute file path
// It is an array of strings performing additional validation:
//  - "exist": file exists
//  - "file", "directory": regular file, directory, or both
//  - "read", "write", "execute": readable|writable|executable permissions
// This is performed before `transform()` and `validate()`.
//  - This allows using `validate()` to validate file existence, parent
//    directories, timestamps, file types, etc.
// eslint-disable-next-line import/no-default-export
export default {
  name: 'path',
  hasInput: true,
  normalize,
  main,
}
