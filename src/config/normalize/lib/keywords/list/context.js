const main = (definition) => ({ info: { context: definition } })

// eslint-disable-next-line import/no-default-export
export default {
  name: 'context',
  undefinedInput: true,
  exampleDefinition: { anyContextProp: true },
  main,
}
