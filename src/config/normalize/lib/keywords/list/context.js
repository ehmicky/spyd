const main = function (definition) {
  return { info: { context: definition } }
}

// eslint-disable-next-line import/no-default-export
export default {
  name: 'context',
  undefinedInput: true,
  main,
}
