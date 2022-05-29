import { set, remove } from 'wild-wild-path'

// Set an `input`'s new value.
// `undefined` values delete the property too.
export const setInputs = function (inputs, path, input) {
  return input === undefined ? remove(inputs, path) : set(inputs, path, input)
}
