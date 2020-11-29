import mapObj from 'map-obj'

// Array configuration properties can be specified on the CLI either using:
//   --name=value --name=otherValue
//   --name=value,otherValue
export const normalizeArrayProps = function (config) {
  return mapObj(config, normalizeArrayProp)
}

const normalizeArrayProp = function (key, value) {
  if (!Array.isArray(value)) {
    return [key, value]
  }

  const valueA = [].concat(...value.map(splitArrayProp))
  return [key, valueA]
}

const splitArrayProp = function (value) {
  return value.split(ARRAY_PROP_DELIMITER)
}

const ARRAY_PROP_DELIMITER = /\s*,\s*/gu
