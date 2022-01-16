import { mapValues } from '../../../utils/map.js'

// Compress `result.combinations[*].dimensions` from objects to strings
export const compressDimensions = function (dimensions) {
  return mapValues(dimensions, compressDimension)
}

const compressDimension = function ({ id }) {
  return id
}

// Decompress `result.combinations[*].dimensions` from strings to objects
export const decompressDimensions = function (dimensions) {
  return mapValues(dimensions, decompressDimension)
}

const decompressDimension = function (id) {
  return { id }
}
