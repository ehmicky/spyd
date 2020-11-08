import isPlainObj from 'is-plain-obj'

import { validateProp } from './helpers.js'

// Validate that inputs have correct shape
export const validateInputs = function (validators, inputs) {
  if (!Array.isArray(inputs)) {
    throw new TypeError(`'inputs' must be an array of objects`)
  }

  inputs.forEach((input) => {
    validateInput(input, validators)
  })
}

const validateInput = function (input, validators) {
  if (!isPlainObj(input)) {
    throw new TypeError(`'inputs' must be an array of objects`)
  }

  const { id } = input

  if (id === undefined) {
    throw new TypeError(`All 'inputs' must have 'id' properties`)
  }

  Object.entries(input).forEach(([propName, prop]) => {
    validateProp({ id, validators, category: 'input', propName, prop })
  })
}
