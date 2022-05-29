const normalize = function (definition) {
  if (typeof definition !== 'boolean') {
    throw new TypeError('Definition must be a boolean.')
  }

  return definition
}

const main = function (definition) {
  return definition ? undefined : { skip: true }
}

// Apply `condition[(input, info)]` which skips the current rule if `false`
// is returned.
// eslint-disable-next-line import/no-default-export
export default {
  name: 'condition',
  hasInput: true,
  undefinedInput: true,
  normalize,
  main,
}
