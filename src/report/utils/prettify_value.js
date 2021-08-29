import isPlainObj from 'is-plain-obj'

import { subtitleColor } from './colors.js'
import { indentBlock } from './indent.js'

// Prettify a value by highlighting keys and indenting it
export const prettifyValue = function (value) {
  if (Array.isArray(value)) {
    return prettifyArray(value)
  }

  if (isPlainObj(value)) {
    return prettifyObject(value)
  }

  if (value === undefined) {
    return ''
  }

  return String(value).trim()
}

const prettifyArray = function (array) {
  const prettifiedArray = array.map(prettifyValue).filter(Boolean)
  const newlines = array.some(isComplex) ? '\n\n' : '\n'
  return prettifiedArray.join(newlines)
}

const prettifyObject = function (object) {
  return Object.entries(object)
    .map(prettifyObjectPair)
    .filter(Boolean)
    .join('\n')
}

const prettifyObjectPair = function ([name, value]) {
  const string = prettifyValue(value)

  if (string === '') {
    return ''
  }

  const stringA = isComplex(value) ? `\n${indentBlock(string)}` : ` ${string}`
  const prefix = getPrefix(name)
  return `${prefix}${stringA}`
}

const isComplex = function (value) {
  return Array.isArray(value) || isPlainObj(value)
}

const getPrefix = function (name) {
  return subtitleColor(`${name}:`)
}
