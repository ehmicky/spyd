const main = function (definition) {
  return { input: definition }
}

// Apply `compute[(info)]` which sets an input from the system, instead of the
// user
// eslint-disable-next-line import/no-default-export
export default {
  name: 'compute',
  undefinedInput: true,
  undefinedDefinition: true,
  main,
}
