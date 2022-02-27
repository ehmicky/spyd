import { isAnyNode } from './node.js'
import { ANY } from './special.js'

// From an array of property names to an array to nodes
export const pathToNodes = function (path) {
  return path.map(getPropNameNode)
}

const getPropNameNode = function (propName) {
  return [propName]
}

// Inverse of `pathToNodes()`
export const nodesToPath = function (nodes) {
  return nodes.map(getNodePropName)
}

const getNodePropName = function (node) {
  if (isAnyNode(node)) {
    throw new Error(`Cannot use wildcard "${ANY}" when using nodesToPath().`)
  }

  return node[0]
}
