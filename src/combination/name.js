import { titleColor, noteColor } from '../report/utils/colors.js'

import { getCombinationIds } from './ids.js'

// Retrieve string with each combination's dimension id.
// This is in contrast with `combinationTitle`:
//  - `combinationTitle` uses dimensions titles, which is more useful at
//    report time
//  - `combinationName` uses ids, which is more useful at `run`-time
//    (`dev`, preview bottom bar) since users might use those on the next run
export const getCombinationNameColor = function (combination) {
  return getCombinationIds(combination)
    .map(getCombinationNamePart)
    .join(NAME_SEPARATOR_COLOR)
}

const getCombinationNamePart = function ({ dimension: { messageName }, id }) {
  const idColor = titleColor(id)
  return `${noteColor(messageName)} ${QUOTE_COLOR}${idColor}${QUOTE_COLOR}`
}

const NAME_SEPARATOR_COLOR = noteColor(', ')
const QUOTE_COLOR = noteColor('"')
