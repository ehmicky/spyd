import { setInputs } from './set.js'

// Keywords can transform the input by returning a `value` property
// We allow transforming to `undefined`, i.e. returning `{ value: undefined }`
// is different from returning `{}`.
export const transformInput = function ({
  returnValue,
  input,
  inputs,
  opts: { path },
}) {
  if (!('input' in returnValue) || returnValue.input === input) {
    return { input, inputs }
  }

  const { input: inputA } = returnValue
  const inputsA = setInputs(inputs, path, inputA)
  return { input: inputA, inputs: inputsA }
}
