import mapObj from 'map-obj'

// Compress `result.combinations[*].dimensions` from objects to strings
export const compressDimensions = function (dimensions) {
  return mapObj(dimensions, compressDimension)
}

const compressDimension = function (dimension, { id }) {
  return [dimension, id]
}

// Decompress `result.combinations[*].dimensions` from strings to objects
export const decompressDimension = function (dimension, id) {
  return [dimension, { id }]
}
