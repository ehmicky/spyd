const test = function (input) {
  return input === undefined
}

const normalize = function (definition) {
  if (typeof definition !== 'boolean') {
    throw new TypeError('Definition must be a boolean.')
  }

  return definition
}

const main = function (definition) {
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
  test,
  normalize,
  main,
}
