import { blue } from 'chalk'
import isPlainObj from 'is-plain-obj'

import { indentBlock } from './indent.js'
import { joinSections, joinSubSections } from './join.js'

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
  const prettifiedArray = array.map(prettifyValue)
  return array.some(isComplex)
    ? joinSections(prettifiedArray)
    : joinSubSections(prettifiedArray)
}

const prettifyObject = function (object) {
  return joinSubSections(Object.entries(object).map(prettifyObjectPair))
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
  return blue.bold(`${name}:`)
}
