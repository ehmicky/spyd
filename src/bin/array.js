import mapObj from 'map-obj'

// Array options can be specified on the CLI either using:
//   --name=value --name=otherValue
//   --name=value,otherValue
export const normalizeArrayOpts = function (opts) {
  return mapObj(opts, normalizeArrayOpt)
}

const normalizeArrayOpt = function (key, value) {
  if (!Array.isArray(value)) {
    return [key, value]
  }

  const valueA = [].concat(...value.map(splitArrayOpt))
  return [key, valueA]
}

const splitArrayOpt = function (value) {
  return value.split(ARRAY_OPT_DELIMITER)
}

const ARRAY_OPT_DELIMITER = /\s*,\s*/gu
