import { FORMATS_ARRAY } from './all/main.js'

// Turn formats into an object instead of an array, making it easier to access
// any specific format
const getFormats = () => Object.fromEntries(FORMATS_ARRAY.map(getFormatPair))

const getFormatPair = (format) => [format.name, format]

export const FORMATS = getFormats()

// Return all possible `report*()` methods
export const getReportMethods = () => [
  ...new Set(FORMATS_ARRAY.flatMap(getFormatReportMethods)),
]

const getFormatReportMethods = ({ methods }) => methods
