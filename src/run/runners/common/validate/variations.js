import isPlainObj from 'is-plain-obj'

import { validateProp } from './helpers.js'

// Validate that variations have correct shape
export const validateVariations = function(validators, variations) {
  if (!Array.isArray(variations)) {
    throw new TypeError(`'variations' must be an array of objects`)
  }

  variations.forEach(variation => validateVariation(variation, validators))
}

const validateVariation = function(variation, validators) {
  if (!isPlainObj(variation)) {
    throw new TypeError(`'variations' must be an array of objects`)
  }

  const { id } = variation

  if (id === undefined) {
    throw new TypeError(`All 'variations' must have 'id' properties`)
  }

  Object.entries(variation).forEach(([propName, prop]) =>
    validateProp({ id, validators, category: 'variation', propName, prop }),
  )
}
