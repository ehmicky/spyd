import { constants } from 'node:fs'

import { checkAccess, checkAccessAsync } from './access.js'
import { EXIST_KEYWORD } from './normalize.js'

// Check if a file exists
export const fileExists = function (input) {
  return checkAccess(input, constants.F_OK)
}

export const fileExistsAsync = async function (input) {
  return await checkAccessAsync(input, constants.F_OK)
}

// Fail if a file does not exist and the "exist" keyword was used
export const validateExists = function (keywords) {
  if (keywords.has(EXIST_KEYWORD)) {
    throw new Error('must be an existing file.')
  }
}
