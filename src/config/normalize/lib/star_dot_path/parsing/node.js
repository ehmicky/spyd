import isPlainObj from 'is-plain-obj'

// Create a token part for property names or array indices
export const createPropPart = function (value) {
  return { type: PROP_TYPE, value }
}

// Retrieve the value of a prop token part
export const getPropPartValue = function ({ value }) {
  return value
}

const PROP_TYPE = 'prop'

// Check if at least one node has some ANY parts
export const isAnyNodes = function (nodes) {
  return nodes.some(isAnyNode)
}

// Check if a node has some ANY parts
export const isAnyNode = function (node) {
  return node.some(isAnyPart)
}

// Check if a token part is ANY
export const isAnyPart = function (part) {
  return isPlainObj(part) && part.type === ANY_TYPE
}

// Create an ANY token part
export const createAnyPart = function () {
  return { type: ANY_TYPE }
}

const ANY_TYPE = 'any'
