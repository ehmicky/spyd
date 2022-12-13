import { normalizeBoolean } from '../normalize/common.js'

const test = (input) => input === undefined

const main = (definition) => {
  if (definition) {
    throw new Error('must be defined.')
  }
}

// Apply `required[(info)]` which throws if `true` and input is `undefined`.
// On `array.*`, this validates against sparse arrays.
// eslint-disable-next-line import/no-default-export
export default {
  name: 'required',
  undefinedInput: true,
  exampleDefinition: true,
  test,
  normalize: normalizeBoolean,
  main,
}
