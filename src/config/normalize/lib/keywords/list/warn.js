const normalize = function (definition) {
  if (typeof definition !== 'string') {
    throw new TypeError('Definition must be a string.')
  }

  return definition.trim()
}

const main = function (definition) {
  return { warning: definition }
}

// Apply `warn[(input, info)]` which can return a string to print as warning
// eslint-disable-next-line import/no-default-export
export default {
  name: 'warn',
  hasInput: true,
  normalize,
  main,
}
