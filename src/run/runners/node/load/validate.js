import { validateTask } from '../../common/validate/file.js'
import {
  validateBoolean,
  validateFunction,
} from '../../common/validate/type.js'

// Validate that the tasks file has correct shape
export const validateFile = function (entries) {
  validateTask(entries, VALIDATORS)
}

const VALIDATORS = {
  main: validateFunction,
  before: validateFunction,
  after: validateFunction,
  async: validateBoolean,
}
