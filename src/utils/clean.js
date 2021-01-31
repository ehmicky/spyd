import isPlainObj from 'is-plain-obj'

// Deeply remove `undefined` values in an object
export const cleanObject = function (obj) {
  if (Array.isArray(obj)) {
    return obj.map(cleanObject)
  }

  if (!isPlainObj(obj)) {
    return obj
  }

  return Object.fromEntries(
    Object.entries(obj).filter(isDefined).map(cleanField),
  )
}

const isDefined = function ([, value]) {
  return value !== undefined
}

const cleanField = function ([name, value]) {
  return [name, cleanObject(value)]
}
