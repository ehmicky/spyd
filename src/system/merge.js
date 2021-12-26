import { isDeepStrictEqual } from 'util'

import { setArray } from '../utils/set.js'

// When merging results, we report all `systems`. This concatenates them.
// Systems with all dimensions equal are merged, with the most recent result
// having priority.
// Order matters: we show more recent systems first, i.e. they must be first
// in the array.
// `system` objects should not contain `undefined`, so we can directly merge.
// `git` and `machine` properties should not be deeply merged since their
// properties relate to each other. However, `versions` should.
export const normalizeSystems = function ({ system, ...rawResult }) {
  return { ...rawResult, systems: [system] }
}

export const mergeSystems = function (result, previousResult) {
  const systems = appendSystem(result, previousResult)
  return { ...result, systems }
}

const appendSystem = function ({ systems }, { system: previousSystem }) {
  const systemIndex = systems.findIndex(({ dimensions }) =>
    isDeepStrictEqual(dimensions, previousSystem.dimensions),
  )
  return systemIndex === -1
    ? [...systems, previousSystem]
    : setArray(
        systems,
        systemIndex,
        mergePreviousSystem(systems[systemIndex], previousSystem),
      )
}

const mergePreviousSystem = function (system, previousSystem) {
  return {
    ...previousSystem,
    ...system,
    versions: { ...previousSystem.versions, ...system.versions },
  }
}
