import { SYSTEM_PREFIX } from '../combination/dimensions.js'

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
  return propName.startsWith(SYSTEM_PREFIX)
}

const renameSystemId = function (rawResult, [propName, { id }]) {
  const propNameA = unprefixPropName(propName)
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

const unprefixPropName = function (propName) {
  return propName.slice(SYSTEM_PREFIX.length)
}
