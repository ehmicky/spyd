import { ANY_TOKEN } from './special.js'

// Normalize a path of tokens
export const normalizePath = function (path) {
  return path.map(normalizeNode)
}

// Nodes can be both arrays and not arrays (if they have a single element) but
// we encourage the latter since it is simpler
const normalizeNode = function (node) {
  const nodeA = node.length === 1 ? node[0] : node
  validateComplexNode(nodeA)
  return nodeA
}

const validateComplexNode = function (node) {
  if (Array.isArray(node)) {
    node.forEach(validateComplexToken)
  }
}

const validateComplexToken = function (token) {
  if (typeof token === 'symbol' && token !== ANY_TOKEN) {
    throw new TypeError(`${String(token)} must not be in a nested array.`)
  }
}
