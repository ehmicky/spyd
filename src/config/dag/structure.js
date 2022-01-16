import { listNewCycles } from './cycle.js'

// Create a data structure for a DAG (directed acyclic graph) without any edges
export const createDag = function (names) {
  return Object.fromEntries(names.map(getDagEntry))
}

const getDagEntry = function (name) {
  return [name, []]
}

// Add a new edge to the DAG
export const addDagEdge = function (dag, parentName, childName) {
  // eslint-disable-next-line fp/no-mutating-methods
  dag[parentName].push(childName)
  validateCycles(dag, parentName, childName)
}

// Validate that there are no cycles
const validateCycles = function (dag, parentName, childName) {
  if (parentName === childName) {
    throw new Error(`"${parentName}" cannot reference itself.`)
  }

  const cycles = listNewCycles(dag, parentName, childName)

  if (cycles.length !== 0) {
    throw new Error(getCyclesError(cycles))
  }
}

const getCyclesError = function (cycles) {
  const cyclesStr = cycles.map(serializeCycle)
  return cyclesStr.length === 1
    ? `Circular dependency: ${cyclesStr[0]}`
    : `Circular dependencies:\n${cyclesStr.join('\n')}`
}

const serializeCycle = function (names) {
  return names.join(' -> ')
}
