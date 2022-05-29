import { set, remove } from 'wild-wild-path'

// Set an `input`'s new value.
// `undefined` values delete the property too.
export const setConfig = function (config, path, input) {
  return input === undefined ? remove(config, path) : set(config, path, input)
}
