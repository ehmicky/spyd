import { isDeepStrictEqual } from 'util'

import isPlainObj from 'is-plain-obj'
import { pathExists } from 'path-exists'
import { isFile, isDirectory } from 'path-type'

export const validateBoolean = function (value) {
  if (typeof value !== 'boolean') {
    throw new TypeError('must be true or false.')
  }
}

export const validateInteger = function (value) {
  if (!Number.isInteger(value)) {
    throw new TypeError('must be an integer.')
  }
}

export const validateNumberString = function (value) {
  if (typeof value !== 'string' && !Number.isFinite(value)) {
    throw new TypeError('must be a string or a number.')
  }

  validateNonEmptyString(value)
}

export const validateDefinedString = function (value) {
  validateString(value)
  validateNonEmptyString(value)
}

const validateNonEmptyString = function (value) {
  if (typeof value === 'string' && value.trim() === '') {
    throw new Error('must not be an empty string.')
  }
}

export const validateString = function (value) {
  if (typeof value !== 'string') {
    throw new TypeError('must be a string.')
  }
}

export const validateEmptyArray = function (value) {
  if (Array.isArray(value) && value.length === 0) {
    throw new Error('must not be an empty array.')
  }
}

export const validateObject = function (value) {
  if (!isPlainObj(value)) {
    throw new Error('must be a plain object.')
  }
}

export const validateJson = function (value) {
  if (!isJson(value)) {
    throw new Error(
      'must only contain strings, numbers, booleans, nulls, arrays or plain objects.',
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

export const validateFunction = function (value) {
  if (typeof value !== 'function') {
    throw new TypeError('must be a function.')
  }
}

export const validateFileExists = async function (value) {
  if (!(await pathExists(value))) {
    throw new Error('must be an existing file.')
  }
}

export const validateRegularFile = async function (value) {
  if ((await pathExists(value)) && !(await isFile(value))) {
    throw new Error('must be a regular file.')
  }
}

export const validateDirectory = async function (value) {
  if ((await pathExists(value)) && !(await isDirectory(value))) {
    throw new Error('must be a directory.')
  }
}
