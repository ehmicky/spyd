import { titleColor, noteColor } from '../report/utils/colors.js'

import { getCombinationIds } from './ids.js'

// Retrieve string with each combination's dimension id.
// Used to name combinations in: `dev` and preview bottom bar.
export const getCombinationName = function (combination) {
  return getCombinationIds(combination)
    .map(getCombinationNamePart)
    .join(noteColor(', '))
}

const getCombinationNamePart = function (
  { dimension: { mainName }, id },
  index,
) {
  const dimension = index === 0 ? titleize(mainName) : mainName
  return `${noteColor(dimension)} ${titleColor(id)}`
}

const titleize = function (string) {
  return `${string.charAt(0).toUpperCase()}${string.slice(1)}`
}
