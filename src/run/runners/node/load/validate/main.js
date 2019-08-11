import { isPlainObject } from '../../../../../utils/main.js'

import { validateTask } from './task.js'
import { validateVariations } from './variation.js'

// Validate that tasks and variations have correct shape
export const validateTaskFile = function(entries, taskPath) {
  if (!isPlainObject(entries)) {
    throw new TypeError(`Tasks must use named exports in '${taskPath}'`)
  }

  if (entries.default !== undefined) {
    throw new TypeError(
      `Tasks must use named exports not default exports in '${taskPath}'`,
    )
  }

  Object.entries(entries).forEach(([name, entry]) =>
    validateEntry(name, entry, taskPath),
  )
}

const validateEntry = function(name, entry, taskPath) {
  if (name === 'variations') {
    validateVariations(entry, taskPath)
    return
  }

  validateTask(name, entry, taskPath)
}
