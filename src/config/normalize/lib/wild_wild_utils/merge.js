import deepmerge from 'deepmerge'
import isPlainObj from 'is-plain-obj'

import { map } from './map.js'

// eslint-disable-next-line max-params
const pushUnshift = function (mapFunc, target, query, newValues, opts = {}) {
  return map(target, query, (value) => mapFunc(value, newValues, opts), {
    ...opts,
    entries: false,
  })
}

const pushValue = function (value, newValues, { mutate }) {
  if (!Array.isArray(value)) {
    return newValues
  }

  if (!mutate) {
    return [...value, ...newValues]
  }

  newValues.forEach((newValue) => {
    // eslint-disable-next-line fp/no-mutating-methods
    value.push(newValue)
  })
  return value
}

// Like `set()` but push an array of values to the target array instead
export const push = pushUnshift.bind(undefined, pushValue)

const unshiftValue = function (value, newValues, { mutate }) {
  if (!Array.isArray(value)) {
    return newValues
  }

  if (!mutate) {
    return [...newValues, ...value]
  }

  newValues.forEach((newValue) => {
    // eslint-disable-next-line fp/no-mutating-methods
    value.unshift(newValue)
  })
  return value
}

// Like `push()` but from the beginning
export const unshift = pushUnshift.bind(undefined, unshiftValue)

// Only own properties are currently merged, even if `inherited` is `true`.
// Non-enumerable properties are ignored.
const mergeValue = function (value, newValue, { mutate, classes, deep }) {
  const isMergeableObject = getIsMergeableObject(classes)
  return deep
    ? deepmerge(value, newValue, { clone: !mutate, isMergeableObject })
    : shallowMergeValue({ value, newValue, mutate, isMergeableObject })
}

const shallowMergeValue = function ({
  value,
  newValue,
  mutate,
  isMergeableObject,
}) {
  if (!isMergeableObject(value)) {
    return newValue
  }

  if (!mutate) {
    return { ...value, ...newValue }
  }

  Object.keys(newValue).forEach((key) => {
    // eslint-disable-next-line no-param-reassign, fp/no-mutation
    value[key] = newValue[key]
  })
  return value
}

// Use similar recursion logic as `iterate()` depending on `classes`
const getIsMergeableObject = function (classes) {
  return classes ? isObjArr : isPlainObjArr
}

const isObjArr = function (value) {
  return typeof value === 'object' && value !== null
}

const isPlainObjArr = function (value) {
  return isPlainObj(value) || Array.isArray(value)
}

// Merge object values
export const merge = pushUnshift.bind(undefined, mergeValue)
