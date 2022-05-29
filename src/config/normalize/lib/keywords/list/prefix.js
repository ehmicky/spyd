const main = function (definition) {
  const prefix = String(definition).trim()
  return { info: { prefix } }
}

// eslint-disable-next-line import/no-default-export
export default {
  name: 'prefix',
  undefinedInput: true,
  main,
}
