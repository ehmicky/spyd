import { remove, set } from 'wild-wild-path'

// Set an `input`'s new value.
// `undefined` values delete the property too.
export const setInputs = (inputs, path, input) =>
  input === undefined ? remove(inputs, path) : set(inputs, path, input)
