import { blue } from 'chalk'
import isPlainObj from 'is-plain-obj'

import { indentBlock } from './indent.js'

// Prettify an object by highlighting keys and indenting it
export const prettifyObject = function (object) {
  return Object.entries(object)
    .filter(hasValue)
    .map(prettifyObjectPair)
    .filter(Boolean)
    .join('\n')
}

const hasValue = function ([, value]) {
  return Boolean(value)
}

const prettifyObjectPair = function ([name, value]) {
  if (isPlainObj(value)) {
    return prettifyObjectChild(name, value)
  }

  if (Array.isArray(value)) {
    return prettifyArrayChild(name, value)
  }

  const prefix = getPrefix(name)
  return `${prefix} ${value}`
}

const prettifyObjectChild = function (name, object) {
  const children = prettifyObject(object)

  if (children === '') {
    return
  }

  const prefix = getPrefix(name)
  return `${prefix}\n${indentBlock(children)}`
}

const prettifyArrayChild = function (name, array) {
  const children = array.filter(Boolean).join('\n')

  if (children === '') {
    return
  }

  const prefix = getPrefix(name)
  return `${prefix}\n${indentBlock(children)}`
}

const getPrefix = function (name) {
  return blue.bold(`${name}:`)
}
