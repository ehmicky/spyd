import { validateTask } from '../../common/validate/file.js'
import {
  validateBoolean,
  validateFunction,
} from '../../common/validate/type.js'

// Validate that the tasks file has correct shape
export const validateFile = function (task) {
  validateTask({ task, validators, requiredProps })
}

const validators = {
  main: validateFunction,
  before: validateFunction,
  after: validateFunction,
  async: validateBoolean,
}
const requiredProps = ['main']
