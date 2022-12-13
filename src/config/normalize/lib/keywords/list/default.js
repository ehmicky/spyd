const test = (input) => input === undefined

const main = (definition) => ({ input: definition })

// Apply `default[(info)]` which assigns a default value
// eslint-disable-next-line import/no-default-export
export default {
  name: 'default',
  undefinedInput: true,
  exampleDefinition: 'anyDefaultValue',
  test,
  main,
}
