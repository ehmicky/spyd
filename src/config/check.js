import { isDeepStrictEqual, inspect } from 'util'

import isPlainObj from 'is-plain-obj'
import mapObj from 'map-obj'

import { UserError } from '../error/main.js'
import { curry, runNormalizer } from '../utils/functional.js'

// Configuration validation helper functions
// eslint-disable-next-line max-params
export const checkArrayItems = function (checkers, value, name, ...args) {
  checkArray(value, name)
  return value.flatMap((item, index) =>
    applyCheckers(checkers, item, getIndexName(name, index, value), ...args),
  )
}

export const cCheckArrayItems = curry(checkArrayItems)

// When array has a single item, it is possible that the value was arrified
const getIndexName = function (name, index, value) {
  return value.length === 1 ? name : `${name}[${index}]`
}

// eslint-disable-next-line max-params
export const checkObjectProps = function (checkers, value, name, ...args) {
  checkObject(value, name)
  return mapObj(value, (childName, childValue) => [
    childName,
    applyCheckers(checkers, childValue, `${name}.${childName}`, ...args),
  ])
}

export const cCheckObjectProps = curry(checkObjectProps)

const applyCheckers = function (checkers, value, ...args) {
  return checkers.reduce(
    (valueA, checker) => runNormalizer(checker, valueA, ...args),
    value,
  )
}

export const checkBoolean = function (value, name) {
  if (typeof value !== 'boolean') {
    throw new UserError(`'${name}' must be true or false: ${inspect(value)}`)
  }
}

export const checkInteger = function (value, name) {
  if (!Number.isInteger(value)) {
    throw new UserError(`'${name}' must be an integer: ${inspect(value)}`)
  }
}

export const checkString = function (value, name) {
  if (typeof value !== 'string') {
    throw new UserError(`'${name}' must be a string: ${inspect(value)}`)
  }
}

export const checkDefinedString = function (value, name) {
  checkString(value, name)

  if (value.trim() === '') {
    throw new UserError(`'${name}' must not be empty.`)
  }
}

const checkArray = function (value, name) {
  if (!Array.isArray(value)) {
    throw new UserError(`'${name}' must be an array: ${inspect(value)}`)
  }
}

// Many array configuration properties can optionally a single element, for
// simplicity providing it is the most common use case.
// We also allow duplicate values but remove them.
export const normalizeOptionalArray = function (value = []) {
  return Array.isArray(value) ? [...new Set(value)] : [value]
}

export const checkArrayLength = function (value, name) {
  if (value.length === 0) {
    throw new UserError(`At least one '${name}' must be defined.`)
  }
}

export const checkObject = function (value, name) {
  if (!isPlainObj(value)) {
    throw new UserError(
      `'${name}' value must be a plain object: ${inspect(value)}`,
    )
  }
}

export const checkJson = function (value, name) {
  if (!isJson(value)) {
    throw new UserError(
      `'${name}' must only contain strings, numbers, booleans, nulls, arrays or plain objects: ${inspect(
        value,
      )}`,
    )
  }
}

const isJson = function (value) {
  try {
    return isDeepStrictEqual(JSON.parse(JSON.stringify(value)), value)
  } catch {
    return false
  }
}
