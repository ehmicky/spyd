import { isPlainObject } from '../../../../../utils/main.js'

import { validateTask } from './task.js'
import { validateVariations } from './variation.js'

// Validate that tasks and variations have correct shape
export const validateTaskFile = function(entries) {
  if (!isPlainObject(entries)) {
    throw new TypeError(`Tasks must use named exports`)
  }

  if (entries.default !== undefined) {
    throw new TypeError(`Tasks must use named exports not default exports`)
  }

  Object.entries(entries).forEach(([name, entry]) => validateEntry(name, entry))
}

const validateEntry = function(name, entry) {
  if (name === 'variations') {
    validateVariations(entry)
    return
  }

  validateTask(name, entry)
}
