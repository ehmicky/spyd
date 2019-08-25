import { isPlainObject } from '../../../../../utils/main.js'

import { validateProp, validateString, validatePrimitive } from './common.js'

// Validate that variations have correct shape
export const validateVariations = function(variations) {
  if (!Array.isArray(variations)) {
    throw new TypeError(`'variations' must be an array of objects`)
  }

  variations.forEach(variation => validateVariation(variation))
}

const validateVariation = function(variation) {
  if (!isPlainObject(variation)) {
    throw new TypeError(`'variations' must be an array of objects`)
  }

  if (variation.id === undefined) {
    throw new TypeError(`All 'variations' must have 'id' properties`)
  }

  Object.entries(variation).forEach(([propName, prop]) =>
    validateProp({
      id: variation.id,
      validators: VALIDATE_VARIATION,
      category: 'variation',
      propName,
      prop,
    }),
  )
}

const VALIDATE_VARIATION = {
  id: validateString,
  title: validateString,
  value: validatePrimitive,
}
