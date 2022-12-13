import isPlainObj from 'is-plain-obj'

import { subtitleColor } from './colors.js'
import { indentBlock } from './indent.js'

// Prettify a value by highlighting keys and indenting it
export const prettifyValue = (value) => {
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

const prettifyArray = (array) => {
  const prettifiedArray = array.map(prettifyValue).filter(Boolean)
  const newlines = array.some(isComplex) ? '\n\n' : '\n'
  return prettifiedArray.join(newlines)
}

const prettifyObject = (object) =>
  Object.entries(object).map(prettifyObjectPair).filter(Boolean).join('\n')

const prettifyObjectPair = ([name, value]) => {
  const string = prettifyValue(value)

  if (string === '') {
    return ''
  }

  const stringA = isComplex(value) ? `\n${indentBlock(string)}` : ` ${string}`
  const prefix = getPrefix(name)
  return `${prefix}${stringA}`
}

const isComplex = (value) => Array.isArray(value) || isPlainObj(value)

const getPrefix = (name) => subtitleColor(`${name}:`)
