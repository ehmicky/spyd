/* eslint-disable max-lines */
import mapObj from 'map-obj'
import stringWidth from 'string-width'

import { goodColor } from '../../utils/colors.js'
import { getCombinationNameColor } from '../../utils/name.js'
import { NAME_SEPARATOR_COLORED } from '../../utils/separator.js'

// Reporter showing boxplot of measures (min, q1, median, q3, max)
const reportTerminal = function (
  { combinations, screenWidth },
  { mini = false },
) {
  const combinationsA = combinations.map(normalizeQuantiles)
  const { minAll, maxAll } = getMinMaxAll(combinationsA)
  const { minBlockWidth, contentWidth } = getWidths(
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
        minBlockWidth,
        contentWidth,
        mini,
      }),
    )
    .join('\n')
}

const normalizeQuantiles = function ({ titles, stats: { quantiles } }) {
  if (quantiles === undefined) {
    return { titles }
  }

  const quantilesA = mapObj(QUANTILES, (name, quantileIndex) => [
    name,
    quantiles[quantileIndex],
  ])
  return { titles, quantiles: quantilesA }
}

const QUANTILES = { min: 0, q1: 25, median: 50, q3: 75, max: 100 }

const getMinMaxAll = function (combinations) {
  const combinationsA = combinations.filter(isMeasuredCombination)

  if (combinationsA.length === 0) {
    return {}
  }

  const minAll = Math.min(
    ...combinationsA.map((combination) => getQuantile(combination, 'min')),
  )
  const maxAll = Math.max(
    ...combinationsA.map((combination) => getQuantile(combination, 'max')),
  )
  return { minAll, maxAll }
}

// When the combination has not been measured yet
const isMeasuredCombination = function ({ quantiles }) {
  return quantiles !== undefined
}

const getQuantile = function ({ quantiles }, statName) {
  return quantiles[statName].raw
}

const getWidths = function (combinations, screenWidth, mini) {
  const titleBlockWidth = getTitleBlockWidth(combinations)
  const minBlockWidth = getMinMaxFullWidth(combinations, mini, 'min')
  const maxBlockWidth = getMinMaxFullWidth(combinations, mini, 'max')
  const contentWidth = Math.max(
    screenWidth - titleBlockWidth - minBlockWidth - maxBlockWidth,
    1,
  )
  return { minBlockWidth, contentWidth }
}

const getMinMaxFullWidth = function (combinations, mini, statName) {
  return mini ? 0 : getMinMaxBlockWidth(combinations, statName)
}

const serializeBoxPlot = function ({
  combination,
  combination: { quantiles },
  minAll,
  maxAll,
  minBlockWidth,
  contentWidth,
  mini,
}) {
  const combinationTitles = getCombinationTitles(combination)

  if (quantiles === undefined) {
    return getEmptyCombination(combinationTitles, mini)
  }

  const positions = getPositions({ quantiles, minAll, maxAll, contentWidth })
  const box = getBox({ positions, minBlockWidth, combinationTitles })

  if (mini) {
    return box
  }

  return addLabels({ positions, minBlockWidth, contentWidth, box })
}

const getTitleBlockWidth = function ([combination]) {
  return stringWidth(getCombinationTitles(combination))
}

const getCombinationTitles = function (combination) {
  return `${getCombinationNameColor(combination)}${NAME_SEPARATOR_COLORED}`
}

const getMinMaxBlockWidth = function (combinations, statName) {
  return Math.max(
    ...combinations.map(({ quantiles }) =>
      getSingleMinMaxWidth(quantiles, statName),
    ),
  )
}

const getSingleMinMaxWidth = function (quantiles, statName) {
  return quantiles === undefined ? 0 : getPaddedMinMaxWidth(quantiles, statName)
}

const getPaddedMinMaxWidth = function (quantiles, statName) {
  return addPadding(quantiles[statName].pretty).length
}

const getEmptyCombination = function (combinationTitles, mini) {
  return mini ? `${combinationTitles}\n` : `${combinationTitles}\n\n`
}

const getPositions = function ({ quantiles, minAll, maxAll, contentWidth }) {
  return mapObj(quantiles, (name, stat) =>
    getPosition({ name, stat, minAll, maxAll, contentWidth }),
  )
}

const getPosition = function ({
  name,
  stat: {
    raw,
    pretty: { length },
    prettyColor,
  },
  minAll,
  maxAll,
  contentWidth,
}) {
  const percentage = (raw - minAll) / (maxAll - minAll)
  const index = Math.min(
    Math.floor(percentage * contentWidth),
    contentWidth - 1,
  )
  return [name, { prettyColor, length, index }]
}

// eslint-disable-next-line complexity, max-statements
const getBox = function ({
  positions: { min, q1, median, q3, max },
  minBlockWidth,
  combinationTitles,
}) {
  const leftSpaceWidth = Math.max(
    minBlockWidth + min.index - min.length - PADDING_WIDTH,
    0,
  )
  const leftSpace = ' '.repeat(leftSpaceWidth)
  const minPadded = addPadding(min.prettyColor)
  const minCharacter = min.index === q1.index ? '' : MIN_CHARACTER
  const leftLineWidth = q1.index - min.index - minCharacter.length
  const leftLine =
    leftLineWidth <= 0 ? '' : LINE_CHARACTER.repeat(leftLineWidth)
  const q1BoxWidth = median.index - q1.index
  const q1Box = q1BoxWidth <= 0 ? '' : BOX_CHARACTER.repeat(q1BoxWidth)
  const medianCharacter = goodColor(MEDIAN_CHARACTER)
  const q3BoxWidth = q3.index - median.index
  const q3Box = q3BoxWidth <= 0 ? '' : BOX_CHARACTER.repeat(q3BoxWidth)
  const maxCharacter = q3.index === max.index ? '' : MAX_CHARACTER
  const rightLineWidth = max.index - q3.index - maxCharacter.length
  const rightLine =
    rightLineWidth <= 0 ? '' : LINE_CHARACTER.repeat(rightLineWidth)
  const maxPadded = addPadding(max.prettyColor)
  return `${combinationTitles}${leftSpace}${minPadded}${minCharacter}${leftLine}${q1Box}${medianCharacter}${q3Box}${rightLine}${maxCharacter}${maxPadded}`
}

// Works on most terminals
const MIN_CHARACTER = '\u251C'
const LINE_CHARACTER = '\u2500'
const BOX_CHARACTER = '\u2591'
const MEDIAN_CHARACTER = '\u2588'
const MAX_CHARACTER = '\u2524'

const PADDING_WIDTH = 1
const PADDING = ' '.repeat(PADDING_WIDTH)

const addPadding = function (string) {
  return `${PADDING}${string}${PADDING}`
}

const addLabels = function ({
  positions: { median },
  minBlockWidth,
  contentWidth,
  box,
}) {
  const labels = getLabels(median, minBlockWidth, contentWidth)
  return `${box}\n${labels}`
}

const getLabels = function (median, minBlockWidth, contentWidth) {
  const leftShift = Math.max(Math.floor((median.length - 1) / 2), 0)
  const medianLabelIndex =
    Math.min(
      Math.max(median.index - leftShift, 0),
      contentWidth - median.length,
    ) + minBlockWidth
  const medianLabelLeft = ' '.repeat(medianLabelIndex)
  return `${medianLabelLeft}${median.prettyColor}`
}

export const boxplot = { reportTerminal }
