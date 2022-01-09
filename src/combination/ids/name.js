import { titleColor, noteColor } from '../../report/utils/colors.js'
import { omitCombNoDimensions } from '../filter.js'

import { getCombDimensionsIds } from './get.js'

// Retrieve error message prefix showing a combination's dimension ids
export const getCombinationPrefix = function (combination, noDimensions) {
  const combinationName = getCombinationName(combination, noDimensions)
  return combinationName === '' ? '' : `In ${combinationName}:\n`
}

// Retrieve string with each combination's dimension id.
// This is in contrast with `combinationTitle`:
//  - `combinationTitle*` uses dimensions titles, which is more useful at
//    report time
//  - `combinationName*` uses ids, which is more useful at `run`-time
//    (`dev`, preview bottom bar) since users might use those on the next run
// This might return an empty string when all dimensions are filtered out:
//  - This happens when benchmarking a single combination
//  - This can also happen during the `init` stage, since it misses the tasks
//    and steps dimensions
export const getCombinationNameColor = function (combination, noDimensions) {
  const combinationA = omitCombNoDimensions(combination, noDimensions)
  return getCombDimensionsIds(combinationA)
    .map(getNameColorPart)
    .join(NAME_SEPARATOR_COLOR)
}

export const getCombinationName = function (combination, noDimensions) {
  const combinationA = omitCombNoDimensions(combination, noDimensions)
  return getCombDimensionsIds(combinationA)
    .map(getNamePart)
    .join(NAME_SEPARATOR)
}

const getNameColorPart = function ({ dimension: { messageName }, id }) {
  const idColor = titleColor(id)
  return `${noteColor(messageName)} ${QUOTE_COLOR}${idColor}${QUOTE_COLOR}`
}

const getNamePart = function ({ dimension: { messageName }, id }) {
  return `${messageName} ${QUOTE}${id}${QUOTE}`
}

const NAME_SEPARATOR = ', '
const NAME_SEPARATOR_COLOR = noteColor(NAME_SEPARATOR)
const QUOTE = '"'
const QUOTE_COLOR = noteColor(QUOTE)
