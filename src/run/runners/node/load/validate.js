import { validateBenchmarkFile } from '../../common/validate/main.js'
import {
  validateString,
  validateFunction,
  validateStringArray,
} from '../../common/validate/helpers.js'
import { validateTasks } from '../../common/validate/tasks.js'
import { validateVariations } from '../../common/validate/variations.js'

// Validate that the benchmark file has correct shape
export const validateFile = function(entries) {
  validateBenchmarkFile(entries, VALIDATORS)
}

const TASK_VALIDATORS = {
  id: validateString,
  title: validateString,
  main: validateFunction,
  before: validateFunction,
  after: validateFunction,
  variations: validateStringArray,
}

const VARIATION_VALIDATORS = {
  id: validateString,
  title: validateString,
  // eslint-disable-next-line no-empty-function
  value() {},
}

const VALIDATORS = {
  tasks: validateTasks.bind(null, TASK_VALIDATORS),
  variations: validateVariations.bind(null, VARIATION_VALIDATORS),
}
