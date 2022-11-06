import { resolve } from 'node:path'

import { validateDefinedString } from '../../normalize/common.js'

import { validateAccess, validateAccessAsync } from './access.js'
import { fileExists, fileExistsAsync, validateExists } from './exist.js'
import { normalize, EXAMPLE_KEYWORDS } from './normalize.js'
import { validateType, validateTypeAsync } from './type.js'

const main = function (keywords, input, { cwd }) {
  const inputA = normalizeInput(input, cwd)
  validateFile(inputA, keywords)
  return { input: inputA }
}

const mainAsync = async function (keywords, input, { cwd }) {
  const inputA = normalizeInput(input, cwd)
  await validateFileAsync(inputA, keywords)
  return { input: inputA }
}

const normalizeInput = function (input, cwd) {
  validateDefinedString(input)
  return resolve(cwd, input)
}

const validateFile = function (input, keywords) {
  if (!fileExists(input)) {
    validateExists(keywords)
    return
  }

  validateType(input, keywords)
  validateAccess(input, keywords)
}

const validateFileAsync = async function (input, keywords) {
  if (!(await fileExistsAsync(input))) {
    validateExists(keywords)
    return
  }

  await validateTypeAsync(input, keywords)
  await validateAccessAsync(input, keywords)
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
  exampleDefinition: EXAMPLE_KEYWORDS,
  normalize,
  main,
  mainAsync,
}
