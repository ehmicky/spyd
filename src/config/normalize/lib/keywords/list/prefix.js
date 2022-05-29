const normalize = function (definition) {
  if (typeof definition !== 'string') {
    throw new TypeError('Definition must be a string.')
  }

  return definition.trim()
}

const main = function (definition) {
  return { info: { prefix: definition } }
}

// eslint-disable-next-line import/no-default-export
export default {
  name: 'prefix',
  undefinedInput: true,
  normalize,
  main,
}
