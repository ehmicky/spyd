import { setConfig } from './set.js'

export const transformInput = function ({
  returnValue,
  input,
  config,
  opts: {
    funcOpts: { path },
  },
}) {
  // We allow transforming to `undefined`, i.e. returning
  // `{ input: undefined }` is different from returning `{}`
  if (!('input' in returnValue) || returnValue.input === input) {
    return { input, config }
  }

  const { input: inputA } = returnValue
  const configA = setConfig(config, path, inputA)
  return { input: inputA, config: configA }
}
