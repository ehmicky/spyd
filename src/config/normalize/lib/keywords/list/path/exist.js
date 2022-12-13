import { constants } from 'node:fs'

import { checkAccess, checkAccessAsync } from './access.js'
import { EXIST_KEYWORD } from './normalize.js'

// Check if a file exists
export const fileExists = (input) => checkAccess(input, constants.F_OK)

export const fileExistsAsync = async (input) =>
  await checkAccessAsync(input, constants.F_OK)

// Fail if a file does not exist and the "exist" keyword was used
export const validateExists = (keywords) => {
  if (keywords.has(EXIST_KEYWORD)) {
    throw new Error('must be an existing file.')
  }
}
