const normalize = function () {
  throw new Error('must not return any value.')
}

// eslint-disable-next-line no-empty-function
const main = function () {}

// Apply `validate(input, info)` which throws on validation errors
// eslint-disable-next-line import/no-default-export
export default {
  name: 'validate',
  hasInput: true,
  normalize,
  main,
}
