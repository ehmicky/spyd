import { FORMATS_ARRAY } from './all/main.js'

// Turn formats into an object instead of an array, making it easier to access
// any specific format
const getFormats = function () {
  return Object.fromEntries(FORMATS_ARRAY.map(getFormatPair))
}

const getFormatPair = function (format) {
  return [format.name, format]
}

export const FORMATS = getFormats()

// Return all possible `report*()` methods
export const getReportMethods = function () {
  return [...new Set(FORMATS_ARRAY.flatMap(getFormatReportMethods))]
}

const getFormatReportMethods = function ({ methods }) {
  return methods
}
