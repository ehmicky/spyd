import isPlainObj from 'is-plain-obj'

// Merge two configuration objects. Used to merge:
//  - shared `config`
//  - `spyd.*` with CLI flags
export const mergeConfigs = function (configs) {
  return configs.reduce(
    (configA, configB) => mergeObjects(configA, configB, []),
    {},
  )
}

const mergeObjects = function (objectA, objectB, keys) {
  return Object.entries(objectB).reduce(
    (object, [key, value]) => ({
      ...object,
      [key]: mergeValues(object[key], value, [...keys, key]),
    }),
    objectA,
  )
}

// Arrays do not merge, they override instead.
const mergeValues = function (valueA, valueB, keys) {
  return isPlainObj(valueA) && isPlainObj(valueB)
    ? mergeObjects(valueA, valueB, keys)
    : valueB
}
