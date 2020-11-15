import { validateBenchmarkFile } from '../../common/validate/file.js'
import {
  validateString,
  validateBoolean,
  validateFunction,
  validateStringArray,
} from '../../common/validate/type.js'
import { validateInputs } from '../../common/validate/inputs.js'
import { validateTasks } from '../../common/validate/tasks.js'

// Validate that the benchmark file has correct shape
export const validateFile = function (entries) {
  validateBenchmarkFile(entries, VALIDATORS)
}

const TASK_VALIDATORS = {
  id: validateString,
  title: validateString,
  main: validateFunction,
  before: validateFunction,
  after: validateFunction,
  inputs: validateStringArray,
  async: validateBoolean,
}

const INPUT_VALIDATORS = {
  id: validateString,
  title: validateString,
  // eslint-disable-next-line no-empty-function
  value() {},
}

const VALIDATORS = {
  tasks: validateTasks.bind(undefined, TASK_VALIDATORS),
  inputs: validateInputs.bind(undefined, INPUT_VALIDATORS),
}
