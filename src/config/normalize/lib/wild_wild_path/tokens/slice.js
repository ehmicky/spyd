import isPlainObj from 'is-plain-obj'

import { ARRAY_TOKEN, getArrayIndex } from './array.js'
import { arrayProps } from './common.js'

// Check the type of a parsed token.
const testObject = function (token) {
  return (
    isPlainObj(token) &&
    token.type === SLICE_TYPE &&
    isEdge(token.from) &&
    isEdge(token.to)
  )
}

const isEdge = function (edge) {
  return edge === undefined || ARRAY_TOKEN.testObject(edge)
}

// Serialize a token to a string
const serialize = function ({ from, to }) {
  return `${serializeEdge(from)}${SLICE_DELIM}${serializeEdge(to)}`
}

const serializeEdge = function (edge) {
  return edge === undefined ? DEFAULT_EDGE_STRING : ARRAY_TOKEN.serialize(edge)
}

// Check the type of a serialized token
const testString = function (chars) {
  return SLICE_REGEXP.test(chars)
}

const SLICE_REGEXP = /^(-?\d+)?:(-?\d+)?$/u

// Parse a string into a token
const parse = function (chars) {
  const [from, to] = chars.split(SLICE_DELIM).map(parseEdge)
  return { type: SLICE_TYPE, from, to }
}

const parseEdge = function (chars) {
  return chars === DEFAULT_EDGE_STRING ? undefined : ARRAY_TOKEN.parse(chars)
}

const DEFAULT_EDGE_STRING = ''
const SLICE_DELIM = ':'
const SLICE_TYPE = 'slice'

// Normalize value after parsing or serializing
const normalize = function ({ type, from = 0, to }) {
  const toA = Object.is(to, -0) ? undefined : to
  return { type, from, to: toA }
}

// Use the token to list entries against a target value.
const iterate = function (value, { from, to }, missing) {
  const fromIndex = getBoundedIndex(value, from)
  const toIndex = Math.max(getBoundedIndex(value, to), fromIndex)
  return new Array(toIndex - fromIndex).fill().map((_, index) => ({
    value: value[index + fromIndex],
    prop: index + fromIndex,
    missing,
  }))
}

// Unlike the array token, indices are max-bounded to the end of the array:
//  - This prevents maliciously creating big arrays to crash the process
//  - Appending values is less useful in the context of a slice
const getBoundedIndex = function (value, edge) {
  return Math.min(getArrayIndex(value, edge), value.length)
}

// Check if two tokens are the same
const equals = function (tokenA, tokenB) {
  return Object.is(tokenA.from, tokenB.from) && Object.is(tokenA.to, tokenB.to)
}

export const SLICE_TOKEN = {
  testObject,
  serialize,
  testString,
  parse,
  normalize,
  ...arrayProps,
  iterate,
  equals,
}
