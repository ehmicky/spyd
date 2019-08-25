import {
  validateBenchmarkFile,
  validateString,
  validateFunction,
  validateStringArray,
  validateTasks,
  validateVariations,
} from '../../common/validate/main.js'

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
