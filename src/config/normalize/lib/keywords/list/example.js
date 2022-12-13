const main = (definition) => ({ info: { example: definition } })

// Add an example input value as error suffix, as provided by `example[(info)]`
// eslint-disable-next-line import/no-default-export
export default {
  name: 'example',
  aliases: ['default'],
  exampleDefinition: 'anyExampleValue',
  undefinedInput: true,
  main,
}
