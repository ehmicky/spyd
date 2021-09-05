import {
  getCombinationName,
  getCombinationNameColor,
} from '../../utils/name.js'
import {
  NAME_SEPARATOR,
  NAME_SEPARATOR_COLORED,
} from '../../utils/separator.js'

// Retrieve width of all combinations titles.
// Since they are padded, they all have the same width.
export const getTitlesWidth = function ([combination]) {
  return `${getCombinationName(combination)}${NAME_SEPARATOR}`.length
}

// Retrieve a combination's titles
export const getCombinationTitles = function (combination) {
  return `${getCombinationNameColor(combination)}${NAME_SEPARATOR_COLORED}`
}
