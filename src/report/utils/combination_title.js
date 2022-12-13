import { titleColor } from './colors.js'
import { TITLE_SEPARATOR, TITLE_SEPARATOR_COLORED } from './separator.js'

// Retrieve a combination's title with padding and color
export const getCombTitleColorPad = (combination) => {
  const combinationTitleColor = getCombinationTitleColor(combination)
  return combinationTitleColor === ''
    ? ''
    : `${combinationTitleColor}${TITLE_SEPARATOR_COLORED}`
}

// Retrieve a combination's title with padding
export const getCombinationTitlePad = (combination) => {
  const combinationTitle = getCombinationTitle(combination)
  return combinationTitle === '' ? '' : `${combinationTitle}${TITLE_SEPARATOR}`
}

// Retrieve the prettified combination title to used as a first column
export const getCombinationTitleColor = (combination) => {
  const combinationTitle = getCombinationTitle(combination)
  return combinationTitle === '' ? '' : titleColor(combinationTitle)
}

// `dimensions` might be empty, e.g. when there is a single combination in the
// result. In that case, no `combinationTitle` should be shown.
const getCombinationTitle = ({ dimensions }) => {
  const combinationTitle = Object.values(dimensions)
    .map(getTitlePadded)
    .join(COMBINATION_TITLE_MIDDLE)
  return combinationTitle === ''
    ? ''
    : `${COMBINATION_TITLE_START}${combinationTitle}${COMBINATION_TITLE_END}`
}

const getTitlePadded = ({ titlePadded }) => titlePadded

const COMBINATION_TITLE_START = '[ '
const COMBINATION_TITLE_END = ' ]'
const COMBINATION_TITLE_MIDDLE = ' | '
