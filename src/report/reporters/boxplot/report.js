import { getCombTitleColorPad } from '../../utils/combination_title.js'

import { getBox } from './box.js'
import { getLabels } from './labels.js'
import { getMinMaxAll } from './min_max.js'
import { normalizeQuantiles, isMeasuredCombination } from './normalize.js'
import { getPositions } from './position.js'
import { getWidths } from './width.js'

// Reporter showing boxplot of measures (min, q1, median, q3, max)
export const reportTerminal = function (
  { combinations, screenWidth },
  { mini },
) {
  const combinationsA = combinations.map(normalizeQuantiles)
  const { minAll, maxAll } = getMinMaxAll(combinationsA)
  const { titlesWidth, minBlockWidth, contentWidth } = getWidths({
    combinations: combinationsA,
    mini,
    screenWidth,
    minAll,
    maxAll,
  })
  return combinationsA
    .map((combination) =>
      serializeCombination({
        combination,
        minAll,
        maxAll,
        titlesWidth,
        minBlockWidth,
        contentWidth,
        mini,
      }),
    )
    .join('\n')
}

const serializeCombination = function ({
  combination,
  minAll,
  maxAll,
  titlesWidth,
  minBlockWidth,
  contentWidth,
  mini,
}) {
  const combinationTitles = getCombTitleColorPad(combination)

  if (!isMeasuredCombination(combination)) {
    return getEmptyCombination(combinationTitles, mini)
  }

  const positions = getPositions({ combination, minAll, maxAll, contentWidth })
  const box = getBox({ positions, minBlockWidth, combinationTitles, mini })
  const labels = mini
    ? ''
    : getLabels({ positions, titlesWidth, minBlockWidth, contentWidth })
  return `${box}${labels}`
}

// Shown when a combination has not been measured yet
const getEmptyCombination = function (combinationTitles, mini) {
  const labelsLine = mini ? '' : '\n'
  return `${combinationTitles}\n${labelsLine}`
}
