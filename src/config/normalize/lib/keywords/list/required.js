export const name = 'required'
// eslint-disable-next-line unicorn/no-null
export const undefinedInput = null

// Apply `required[(opts)]` which throws if `true` and input is `undefined`.
// On `array.*`, this validates against sparse arrays.
export const main = function (definition) {
  if (definition) {
    throw new Error('must be defined.')
  }
}
