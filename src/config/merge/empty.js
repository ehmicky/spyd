import filterObj from 'filter-obj'
import isPlainObj from 'is-plain-obj'
import mapObj from 'map-obj'

// We remove `null` values so that those can be used to unset properties from
// shared configurations.
// We remove `undefined` values so `Object.keys()` does not show them and to
// make printing configuration nicer.
export const removeEmptyValues = function (object) {
  const objectA = removeEmptyChildren(object)
  return mapObj(objectA, removeEmptyPair, { deep: true })
}

const removeEmptyPair = function (key, value) {
  return [key, removeEmptyChildren(value)]
}

const removeEmptyChildren = function (value) {
  if (isPlainObj(value)) {
    return filterObj(value, isNotEmptyPair)
  }

  if (Array.isArray(value)) {
    return value.filter(isNotEmptyValue)
  }

  return value
}

const isNotEmptyPair = function (key, value) {
  return isNotEmptyValue(value)
}

const isNotEmptyValue = function (value) {
  return value !== null && value !== undefined
}
