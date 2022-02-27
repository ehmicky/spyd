// Create a token for property names or array indices
export const createPropToken = function (value) {
  return { type: PROP_TYPE, value }
}

// Retrieve the value of a prop token
export const getPropTokenValue = function (token) {
  return token.value
}

const PROP_TYPE = 'prop'

// Check if at least one node has some ANY tokens
export const isAnyNodes = function (nodes) {
  return nodes.some(isAnyNode)
}

// Check if a node has some ANY tokens
export const isAnyNode = function (node) {
  return node.some(isAnyToken)
}

// Check if a token is ANY
export const isAnyToken = function (token) {
  return token.type === ANY_TYPE
}

// Create an ANY token
export const createAnyToken = function () {
  return { type: ANY_TYPE }
}

const ANY_TYPE = 'any'
