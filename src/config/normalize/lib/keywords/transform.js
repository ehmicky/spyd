import { setInputs } from './set.js'

// Keywords can transform the input by returning a `value` property
// We allow transforming to `undefined`, i.e. returning `{ value: undefined }`
// is different from returning `{}`.
export const transformInput = function ({
  returnValue,
  input,
  state,
  state: { inputs },
  info: { path },
}) {
  if (!('input' in returnValue) || returnValue.input === input) {
    return input
  }

  const { input: inputA } = returnValue
  state.inputs = setInputs(inputs, path, inputA)
  return inputA
}
