import filterObj from 'filter-obj'

import { getCombinationName } from '../../combination/name.js'

// When an error happens while a measuring a specific combination, display its
// dimensions in the error message
export const prependMeasureError = function (error, combination) {
  const combinationPrefix = getCombinationPrefix(combination)
  error.message = `In ${combinationPrefix}:\n${error.message}`
}

const getCombinationPrefix = function (combination) {
  const dimensions = filterObj(combination.dimensions, shouldKeepDimension)
  return getCombinationName({ ...combination, dimensions })
}

// Some dimensions are always the same during a given run, i.e. are not useful
// in error messages
const shouldKeepDimension = function (dimension) {
  return !dimension.startsWith('system')
}
