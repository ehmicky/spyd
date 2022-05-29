const test = function (input) {
  return input === undefined
}

const main = function (definition) {
  return { input: definition }
}

// Apply `default[(info)]` which assigns a default value
// eslint-disable-next-line import/no-default-export
export default {
  name: 'default',
  undefinedInput: true,
  exampleDefinition: 'anyDefaultValue',
  test,
  main,
}
