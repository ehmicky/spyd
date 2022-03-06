import { ANY_TOKEN } from './special.js'

// Check if * is used
export const pathHasAny = function (path) {
  return path.some(nodeHasAny)
}

const nodeHasAny = function (node) {
  return node === ANY_TOKEN || (Array.isArray(node) && node.includes(ANY_TOKEN))
}

// Check if node is an array index
export const isIndexNode = function (node) {
  return Number.isInteger(node)
}
