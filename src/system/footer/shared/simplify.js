import { uniqueDeep } from '../../../utils/unique.js'

import { concatDimensionsValues } from './concat.js'
import { skipRedundantInfo } from './redundant.js'

// Reduce the amount of system dimensions and properties so the system footer
// looks simpler
export const simplifyPropGroups = function (propGroups, systems) {
  return propGroups.map((propGroup) => simplifyPropGroup(propGroup, systems))
}

const simplifyPropGroup = function ({ propEntries, dimensionsArray }, systems) {
  const dimensionsArrayA = skipRedundantInfo(dimensionsArray, systems)
  const dimensionsArrayB = uniqueDeep(dimensionsArrayA)
  const dimensionsArrayC = normalizeTopSystem(dimensionsArrayB)
  const dimensionsArrayD = concatDimensionsValues(dimensionsArrayC)
  return { propEntries, dimensionsArray: dimensionsArrayD }
}

// Properties which apply to all systems result in a `dimensionsArray` with a
// single empty object. We normalize it to an empty array.
const normalizeTopSystem = function (dimensionsArray) {
  return dimensionsArray.filter(isNotEmptyDimensions)
}

const isNotEmptyDimensions = function (dimensions) {
  return Object.keys(dimensions).length !== 0
}
