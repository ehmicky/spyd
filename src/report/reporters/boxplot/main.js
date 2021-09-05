/* eslint-disable max-lines */
import mapObj from 'map-obj'
import stringWidth from 'string-width'

import { concatBlocks } from '../../utils/concat.js'
import { getCombinationNameColor } from '../../utils/name.js'
import { NAME_SEPARATOR_COLORED } from '../../utils/separator.js'

// Reporter showing boxplot of measures (min, p25, median, p75, max)
const reportTerminal = function ({ combinations, screenWidth }) {
  const showStats = true
  const width = getContentWidth(combinations, showStats, screenWidth)
  const { minAll, maxAll } = getMinMaxAll(combinations)
  return combinations.map((combination) =>
    serializeBoxPlot({ combination, minAll, maxAll, width, showStats }),
  )
}

const getMinMaxAll = function (combinations) {
  combinations.filter(isMeasuredCombination)
}

const getContentWidth = function (combinations, showStats, screenWidth) {
  return Math.max(
    screenWidth -
      getTitleBlockWidth(combinations) -
      getMinBlockWidth(combinations, showStats) -
      getMaxBlockWidth(combinations, showStats),
    1,
  )
}

const serializeBoxPlot = function ({
  combination,
  combination: {
    stats: { quantiles },
  },
  minAll,
  maxAll,
  width,
  showStats,
}) {
  const titleBlock = getTitleBlock(combination, showStats)

  if (!isMeasuredCombination(combination)) {
    return titleBlock
  }

  const minBlock = getMinBlock(quantiles, showStats)
  const content = getContent({ quantiles, minAll, maxAll, showStats, width })
  const maxBlock = getMaxBlock(quantiles, showStats)
  return concatBlocks([titleBlock, minBlock, content, maxBlock])
}

// When the combination has not been measured yet
const isMeasuredCombination = function ({ stats: { quantiles } }) {
  return quantiles !== undefined
}

// Retrieve sidebar with the combination name
const getTitleBlock = function (combination, showStats) {
  const titleBlockContents = getTitleBlockContents(combination)
  const bottomNewlines = getBottomNewlines(showStats)
  return `${titleBlockContents}\n${bottomNewlines}`
}

const getTitleBlockWidth = function ([combination]) {
  return stringWidth(getTitleBlockContents(combination))
}

const getTitleBlockContents = function (combination) {
  return `${getCombinationNameColor(combination)}${NAME_SEPARATOR_COLORED}`
}

const getBottomNewlines = function (showStats) {
  const bottomNewlinesHeight = showStats ? LABELS_HEIGHT : 0
  return '\n'.repeat(bottomNewlinesHeight)
}

const LABELS_HEIGHT = 1

// Retrieve the blocks that show the lowest|highest value of the histogram, on
// the left|right of it
const getBlock = function (getStat, quantiles, showStats) {
  return showStats ? getStat(quantiles) : ''
}

// Retrieve the width of those blocks
const getBlockWidth = function (getStat, combinations, showStats) {
  return showStats
    ? Math.max(
        ...combinations.map((combination) =>
          getCombinationWidth(combination, getStat),
        ),
      )
    : 0
}

const getCombinationWidth = function ({ stats: { quantiles } }, getStat) {
  return stringWidth(getStat(quantiles))
}

const getMinStat = function (quantiles) {
  const min = quantiles[QUANTILES.min]
  return `${PADDING}${min.prettyPaddedColor}${PADDING}`
}

const getMaxStat = function (quantiles) {
  const max = quantiles[QUANTILES.max]
  return `${PADDING}${max.prettyPaddedColor}${PADDING}`
}

const PADDING_WIDTH = 1
const PADDING = ' '.repeat(PADDING_WIDTH)

const getMinBlock = getBlock.bind(undefined, getMinStat)
const getMinBlockWidth = getBlockWidth.bind(undefined, getMinStat)
const getMaxBlock = getBlock.bind(undefined, getMaxStat)
const getMaxBlockWidth = getBlockWidth.bind(undefined, getMaxStat)

const getContent = function ({ quantiles, minAll, maxAll, width, showStats }) {
  const positions = getPositions({ quantiles, minAll, maxAll, width })
  const box = getBox(positions, width)

  if (!showStats) {
    return box
  }

  const labels = getLabels(positions)
  return `${box}
${labels}`
}

const getPositions = function ({ quantiles, minAll, maxAll, width }) {
  return mapObj(QUANTILES, (name, quantileIndex) =>
    getPosition({ quantiles, quantileIndex, name, minAll, maxAll, width }),
  )
}

const getPosition = function ({
  quantiles,
  quantileIndex,
  name,
  minAll,
  maxAll,
  width,
}) {
  const {
    raw,
    pretty: { length },
    prettyColor,
  } = quantiles[quantileIndex]
  const percentage = (maxAll - minAll) / (raw - minAll)
  const index = Math.min(Math.ceil(percentage * width), width - 1)
  return [name, { prettyColor, length, index }]
}

// eslint-disable-next-line complexity, max-statements
const getBox = function ({ min, p25, median, p75, max }, width) {
  const leftSpaceWidth = min.index
  const leftSpace = ' '.repeat(leftSpaceWidth)
  const minCharacter = min.index === p25.index ? '' : MIN_CHARACTER
  const leftLineWidth = p25.index - min.index - 1
  const leftLine =
    leftLineWidth <= 0 ? '' : LINE_CHARACTER.repeat(leftLineWidth)
  const p25BoxWidth = median.index - p25.index - 1
  const p25Box = p25BoxWidth <= 0 ? '' : BOX_CHARACTER.repeat(p25BoxWidth)
  const p75BoxWidth = p75.index - median.index - 1
  const p75Box = p75BoxWidth <= 0 ? '' : BOX_CHARACTER.repeat(p75BoxWidth)
  const rightLineWidth = max.index - p75.index - 1
  const rightLine =
    rightLineWidth <= 0 ? '' : LINE_CHARACTER.repeat(rightLineWidth)
  const maxCharacter = p75.index === max.index ? '' : MAX_CHARACTER
  const rightSpaceWidth = width - p75.index - 1
  const rightSpace = ' '.repeat(rightSpaceWidth)
  return `${leftSpace}${minCharacter}${leftLine}${p25Box}${MEDIAN_CHARACTER}${p75Box}${rightLine}${maxCharacter}${rightSpace}`
}

// Works on most terminals
const MIN_CHARACTER = '\u9500'
const LINE_CHARACTER = '\u9472'
const BOX_CHARACTER = '\u9617'
const MEDIAN_CHARACTER = '\u9608'
const MAX_CHARACTER = '\u9508'

const getLabels = function ({ median }) {
  const medianLabelIndex =
    median.index - Math.max(Math.floor((median.length - 1) / 2), 0)
  const medianLabelLeft = ' '.repeat(medianLabelIndex - 1)
  return `${medianLabelLeft}${median.prettyColor}`
}

const QUANTILES = {
  min: 0,
  p25: 25,
  median: 50,
  p75: 75,
  max: 100,
}

export const boxplot = { reportTerminal }
