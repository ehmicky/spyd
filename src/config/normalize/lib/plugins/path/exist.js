import { constants } from 'fs'

import { checkAccess } from './access.js'
import { EXIST_KEYWORD } from './check.js'

// Check if a file exists
export const fileExists = async function (value) {
  return await checkAccess(value, constants.F_OK)
}

// Fail if a file does not exist and the "exist" keyword was used
export const validateExists = function (keywords) {
  if (keywords.has(EXIST_KEYWORD)) {
    throw new Error('must be an existing file.')
  }
}
