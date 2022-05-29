import { setConfig } from './set.js'

// Keywords can transform the input by returning a `value` property
// We allow transforming to `undefined`, i.e. returning `{ value: undefined }`
// is different from returning `{}`.
export const transformInput = function ({
  returnValue,
  input,
  config,
  opts: {
    funcOpts: { path },
  },
}) {
  if (!('input' in returnValue) || returnValue.input === input) {
    return { input, config }
  }

  const { input: inputA } = returnValue
  const configA = setConfig(config, path, inputA)
  return { input: inputA, config: configA }
}
