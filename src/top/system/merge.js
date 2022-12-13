import { includeKeys } from 'filter-obj'

import { hasPrefix, removePrefix } from '../../combination/prefix.js'
import { groupBy } from '../../utils/group.js'
import { mapValues, mapKeys } from '../../utils/map.js'

import { mergeVersions } from './versions/merge.js'

// A result can only have a single `system`.
//  - However, when merging results, this becomes several `systems`.
//  - We handle this by making systems combination-specific, set to
//    `combinations[*].system`
//  - When reporting a result, we merge all `combinations[*].system` to an
//    array of `systems`.
// Systems with all dimensions equal are merged, with the most recent result
// having priority.
// We ensure this is performed after:
//  - The `select` logic, so that excluded combinations do not report their
//    systems
//  - Default ids, to correctly handle system default ids
export const mergeSystems = ({ combinations }) => {
  const systems = combinations.map(getCombinationSystem)
  const systemsGroups = Object.values(groupBy(systems, getSystemDimensionsKey))
  return systemsGroups.map(mergeSystemsGroup)
}

const getCombinationSystem = ({ dimensions, system, versions }) => {
  const dimensionsA = includeKeys(dimensions, isSystemDimension)
  const dimensionsB = mapKeys(dimensionsA, removeSystemPrefix)
  const dimensionsC = mapValues(dimensionsB, useDimensionId)
  return { ...system, versions, dimensions: dimensionsC }
}

const isSystemDimension = (dimensionName) => hasPrefix(dimensionName, 'system')

const removeSystemPrefix = (dimensionName) =>
  removePrefix(dimensionName, 'system')

const useDimensionId = ({ id }) => id

const getSystemDimensionsKey = ({ dimensions }) => {
  // eslint-disable-next-line fp/no-mutating-methods
  const dimensionNames = Object.keys(dimensions).sort()
  return dimensionNames
    .map((dimensionName) => `${dimensionName}=${dimensions[dimensionName]}`)
    .join(' ')
}

// Order matters: we show more recent systems first, i.e. they must be first
// in the array.
// We rely on `systems` being sorted from most to least recent result, which
// is based on `combinations` being sorted like this during results merging.
const mergeSystemsGroup = ([mostRecentSystem, ...previousSystems]) =>
  previousSystems.reduce(mergeSystemsPair, mostRecentSystem)

// `system` objects should not contain `undefined`, so we can directly merge.
// `git` and `machine` properties should not be deeply merged since their
// properties relate to each other. However, `versions` should.
const mergeSystemsPair = (system, previousSystem) => {
  const versions = mergeVersions(system.versions, previousSystem.versions)
  return { ...previousSystem, ...system, versions }
}
