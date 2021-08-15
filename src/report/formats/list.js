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
