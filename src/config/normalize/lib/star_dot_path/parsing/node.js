import { ANY_TOKEN } from './special.js'

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
  return token === ANY_TOKEN
}
