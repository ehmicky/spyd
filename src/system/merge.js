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
    ? [...systems, setCommonProps(systems[0], previousSystem)]
    : setArray(
        systems,
        systemIndex,
        mergePreviousSystem(systems[systemIndex], previousSystem),
      )
}

// Some properties are common, i.e. only the most recent value of them is
// ever shown.
const setCommonProps = function (system, previousSystem) {
  if (system === undefined) {
    return previousSystem
  }

  return {
    ...previousSystem,
    versions: { ...previousSystem.versions, Spyd: system.versions.Spyd },
  }
}

const mergePreviousSystem = function (system, previousSystem) {
  return {
    ...previousSystem,
    ...system,
    versions: { ...previousSystem.versions, ...system.versions },
  }
}
