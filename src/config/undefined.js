import { exclude } from 'wild-wild-utils'

// We remove `undefined` values so `Object.keys()` does not show them and to
// make printing configuration nicer.
export const removeUndefined = function (object) {
  return exclude(object, '**', isUndefined)
}

const isUndefined = function (value) {
  return value === undefined
}
