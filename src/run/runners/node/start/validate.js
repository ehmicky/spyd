import { validateTasks } from '../../common/validate/file.js'
import {
  validateBoolean,
  validateFunction,
} from '../../common/validate/type.js'

// Validate that the tasks file has correct shape
export const validateFile = function (tasks) {
  validateTasks({ tasks, validators, requiredProps })
}

const validators = {
  beforeAll: validateFunction,
  beforeEach: validateFunction,
  main: validateFunction,
  afterEach: validateFunction,
  afterAll: validateFunction,
  async: validateBoolean,
}
const requiredProps = ['main']
