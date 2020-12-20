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
  beforeEach: validateFunction,
  afterEach: validateFunction,
  async: validateBoolean,
}
const requiredProps = ['main']
