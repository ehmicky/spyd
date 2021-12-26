import { hasPrefix, removePrefix } from '../combination/prefix.js'

// Some logic updates `rawResult.combinations[*].dimensions[*].id`.
// System ids are persisted in two places: `rawResult.system.dimensions` and
// `rawResult.combinations[*].dimensions`.
// We need to update the former.
export const renameAllSystemIds = function (rawResults) {
  return rawResults.map(renameSystemIds)
}

const renameSystemIds = function (rawResult) {
  const [{ dimensions }] = rawResult.combinations
  return Object.entries(dimensions)
    .filter(isSystemDimension)
    .reduce(renameSystemId, rawResult)
}

const isSystemDimension = function ([propName]) {
  return hasPrefix(propName, 'system')
}

// We ensure that the order of `system.dimensions` is the same as the one used
// in `combinations`, since that order is used in the footer sorting.
const renameSystemId = function (rawResult, [propName, { id }]) {
  const propNameA = removePrefix(propName, 'system')
  return rawResult.system.dimensions[propNameA] === id
    ? rawResult
    : {
        ...rawResult,
        system: {
          ...rawResult.system,
          dimensions: { ...rawResult.system.dimensions, [propNameA]: id },
        },
      }
}
