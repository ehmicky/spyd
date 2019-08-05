import { isPlainObject } from '../../utils/main.js'

import { validateProp, validateString } from './common.js'

// Validate that variations have correct shape
export const validateVariations = function(variations, taskPath) {
  if (!Array.isArray(variations)) {
    throw new TypeError(
      `'variations' in '${taskPath}' must be an array of objects`,
    )
  }

  variations.forEach(variation => validateVariation(variation, taskPath))
}

const validateVariation = function(variation, taskPath) {
  if (!isPlainObject(variation)) {
    throw new TypeError(
      `'variations' in '${taskPath}' must be an array of objects`,
    )
  }

  if (variation.id === undefined) {
    throw new TypeError(
      `All 'variations' in '${taskPath}' must have 'id' properties`,
    )
  }

  Object.entries(variation).forEach(([propName, prop]) =>
    validateProp({
      id: variation.id,
      validators: VALIDATE_VARIATION,
      category: 'variation',
      taskPath,
      propName,
      prop,
    }),
  )
}

const VALIDATE_VARIATION = {
  id: validateString,
  title: validateString,
  // eslint-disable-next-line no-empty-function
  value() {},
}
