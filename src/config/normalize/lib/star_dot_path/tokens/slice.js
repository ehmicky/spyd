import isPlainObj from 'is-plain-obj'

import { ARRAY_TOKEN, getArrayIndex, isIndexString } from './array.js'
import { arrayProps } from './common.js'
import { SLICE } from './special.js'

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
  return `${serializeEdge(from)}${SLICE}${serializeEdge(to)}`
}

const serializeEdge = function (edge) {
  return edge === undefined ? DEFAULT_EDGE_STRING : ARRAY_TOKEN.serialize(edge)
}

// Check the type of a serialized token
const testString = function ({ chars, hasSlice }) {
  return hasSlice && chars.split(SLICE).every(isEdgeString)
}

const isEdgeString = function (chars) {
  return chars === DEFAULT_EDGE_STRING || isIndexString(chars)
}

// Parse a string into a token
const parse = function (chars) {
  const [from, to] = chars.split(SLICE).map(parseEdge)
  return { type: SLICE_TYPE, from, to }
}

const parseEdge = function (chars) {
  return chars === DEFAULT_EDGE_STRING ? undefined : ARRAY_TOKEN.parse(chars)
}

const DEFAULT_EDGE_STRING = ''
const SLICE_TYPE = 'slice'

// Normalize value after parsing or serializing
const normalize = function ({ type, from = 0, to }) {
  const toA = Object.is(to, -0) ? undefined : to
  return { type, from, to: toA }
}

// Use the token to list entries against a target value.
// eslint-disable-next-line max-params
const getEntries = function (value, path, { from, to }, defined) {
  const fromIndex = getArrayIndex(value, from)
  const toIndex = Math.max(getArrayIndex(value, to), fromIndex)
  return new Array(toIndex - fromIndex).fill().map((_, index) => ({
    value: value[index + fromIndex],
    path: [...path, index + fromIndex],
    defined,
  }))
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
  getEntries,
  equals,
}
