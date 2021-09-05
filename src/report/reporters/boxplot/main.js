import { getPositions, getBox, getLabels } from './content.js'
import { getMinMaxAll } from './min_max.js'
import { normalizeQuantiles } from './normalize.js'
import { getCombinationTitles } from './titles.js'
import { getWidths } from './width.js'

// Reporter showing boxplot of measures (min, q1, median, q3, max)
const reportTerminal = function (
  { combinations, screenWidth },
  { mini = false },
) {
  const combinationsA = combinations.map(normalizeQuantiles)
  const { minAll, maxAll } = getMinMaxAll(combinationsA)
  const { titlesWidth, minBlockWidth, contentWidth } = getWidths(
    combinationsA,
    screenWidth,
    mini,
  )
  return combinationsA
    .map((combination) =>
      serializeBoxPlot({
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

const serializeBoxPlot = function ({
  combination,
  combination: { quantiles },
  minAll,
  maxAll,
  titlesWidth,
  minBlockWidth,
  contentWidth,
  mini,
}) {
  const combinationTitles = getCombinationTitles(combination)

  if (quantiles === undefined) {
    return getEmptyCombination(combinationTitles, mini)
  }

  const positions = getPositions({ quantiles, minAll, maxAll, contentWidth })
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

export const boxplot = { reportTerminal }
