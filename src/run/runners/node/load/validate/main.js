import { isPlainObject } from '../../../../../utils/main.js'
import { validateString } from '../../../common/validate.js'
import { validateVariations } from '../../../common/variations.js'

import { validateTasks } from './tasks.js'

// Validate that the benchmark file has correct shape
export const validateBenchmarkFile = function(entries) {
  if (!isPlainObject(entries) || entries.default !== undefined) {
    throw new TypeError(`Benchmark file must use named exports`)
  }

  if (entries.tasks === undefined) {
    throw new TypeError(`Missing property 'tasks'`)
  }

  Object.entries(entries).forEach(validateEntry)
}

const validateEntry = function([name, entry]) {
  const validator = VALIDATORS[name]

  if (validator === undefined) {
    throw new TypeError(`Unknown property '${name}'`)
  }

  validator(entry)
}

const VARIATION_VALIDATORS = {
  id: validateString,
  title: validateString,
  // eslint-disable-next-line no-empty-function
  value() {},
}

const VALIDATORS = {
  variations: validateVariations.bind(null, VARIATION_VALIDATORS),
  tasks: validateTasks,
}
