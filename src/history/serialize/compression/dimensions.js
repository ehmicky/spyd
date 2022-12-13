import { mapValues } from '../../../utils/map.js'

// Compress `result.combinations[*].dimensions` from objects to strings
export const compressDimensions = (dimensions) =>
  mapValues(dimensions, compressDimension)

const compressDimension = ({ id }) => id

// Decompress `result.combinations[*].dimensions` from strings to objects
export const decompressDimensions = (dimensions) =>
  mapValues(dimensions, decompressDimension)

const decompressDimension = (id) => ({ id })
