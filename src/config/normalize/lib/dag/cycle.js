// List all cycles in a DAG
export const listAllCycles = function (dag) {
  const cycles = Object.keys(dag).flatMap((name) => detectCycles(dag, [], name))
  const cyclesA = normalizeCycles(cycles)
  return cyclesA
}

// List all cycles in a DAG, but only the new ones introduced by a new edge in
// the graph
export const listNewCycles = function (dag, parentName, childName) {
  const cycles = detectCycles(dag, [parentName], childName)
  const cyclesA = normalizeCycles(cycles)
  return cyclesA
}

const detectCycles = function (dag, parentNames, name) {
  const newParentNames = [...parentNames, name]

  if (parentNames.includes(name)) {
    return parentNames[0] === name ? [newParentNames] : []
  }

  const childNames = dag[name]
  return childNames.flatMap((childName) =>
    detectCycles(dag, newParentNames, childName),
  )
}

const normalizeCycles = function (cycles) {
  const cyclesA = cycles.filter(isUniqueCycle)
  // eslint-disable-next-line fp/no-mutating-methods
  cyclesA.sort(compareCycles)
  return cyclesA
}

// Remove cycles which differ only by shifting order
const isUniqueCycle = function (cycleA, index, cycles) {
  return !cycles.slice(index + 1).some((cycleB) => hasSameNames(cycleA, cycleB))
}

const hasSameNames = function (cycleA, cycleB) {
  return cycleA.every((name) => cycleB.includes(name))
}

// Sort cycles so that:
//  - Shorter cycles are first
//  - Then by name's lexicographic order, so the output is stable
const compareCycles = function (cycleA, cycleB) {
  if (cycleA.length < cycleB.length) {
    return -1
  }

  if (cycleA.length > cycleB.length) {
    return 1
  }

  const differentIndex = cycleA.findIndex(
    (index) => cycleA[index] !== cycleB[index],
  )
  return cycleA[differentIndex] < cycleB[differentIndex] ? -1 : 1
}
