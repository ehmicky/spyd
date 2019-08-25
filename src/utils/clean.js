import { isPlainObject } from './main.js'

// Deeply remove `undefined` values in an object
export const cleanObject = function(obj) {
  if (!isPlainObject(obj)) {
    return obj
  }

  if (Array.isArray(obj)) {
    return obj.map(cleanObject)
  }

  return Object.fromEntries(
    Object.entries(obj)
      .filter(isDefined)
      .map(cleanField),
  )
}

const isDefined = function([, value]) {
  return value !== undefined
}

const cleanField = function([name, value]) {
  return [name, cleanObject(value)]
}
