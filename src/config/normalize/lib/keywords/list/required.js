export const name = 'required'
export const undefinedInput = true

export const test = function (input) {
  return input === undefined
}

// Apply `required[(opts)]` which throws if `true` and input is `undefined`.
// On `array.*`, this validates against sparse arrays.
export const main = function (definition) {
  if (definition) {
    throw new Error('must be defined.')
  }
}
