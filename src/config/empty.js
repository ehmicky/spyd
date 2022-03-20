import { exclude } from './normalize/lib/wild_wild_utils/main.js'

// We remove `null` values so that those can be used to unset properties from
// shared configurations.
// We remove `undefined` values so `Object.keys()` does not show them and to
// make printing configuration nicer.
export const removeEmptyValues = function (object) {
  return exclude(object, '**', isEmptyValue)
}

const isEmptyValue = function (value) {
  return value === null || value === undefined
}
