import { list } from './get.js'
import { set } from './set.js'

// Inverse of `omit()`. Returns an object with only the properties being queried
export const pick = function (target, queryOrPath) {
  return include(target, queryOrPath, returnTrue)
}

const returnTrue = function () {
  return true
}

// Same but using a function returning the value to set
const include = function (target, queryOrPath, condition) {
  const entries = list(target, queryOrPath)
  return entries.filter(condition).reduce(includeEntry, {})
}

const includeEntry = function (newTarget, { value, path }) {
  return set(newTarget, path, value)
}
