/* eslint-disable max-lines */
import mapObj from 'map-obj'
import stringWidth from 'string-width'

import { goodColor } from '../../utils/colors.js'
import { concatBlocks } from '../../utils/concat.js'
import { getCombinationNameColor } from '../../utils/name.js'
import { NAME_SEPARATOR_COLORED } from '../../utils/separator.js'

// Reporter showing boxplot of measures (min, p25, median, p75, max)
const reportTerminal = function (
  { combinations, screenWidth },
  { mini = false },
) {
  const combinationsA = combinations.map(normalizeQuantiles)
  const { minAll, maxAll } = getMinMaxAll(combinationsA)
  const width = getContentWidth(combinationsA, mini, screenWidth)
  return combinationsA
    .map((combination) =>
      serializeBoxPlot({ combination, minAll, maxAll, width, mini }),
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

const QUANTILES = { min: 0, p25: 25, median: 50, p75: 75, max: 100 }

const getMinMaxAll = function (combinations) {
  const combinationsA = combinations.filter(isMeasuredCombination)

  if (combinationsA.length === 0) {
    return {}
  }

  const minAll = Math.min(...combinationsA.map(getMinQuantile))
  const maxAll = Math.max(...combinationsA.map(getMaxQuantile))
  return { minAll, maxAll }
}

const getMinQuantile = function ({
  quantiles: {
    min: { raw },
  },
}) {
  return raw
}

const getMaxQuantile = function ({
  quantiles: {
    max: { raw },
  },
}) {
  return raw
}

const getContentWidth = function (combinations, mini, screenWidth) {
  return Math.max(
    screenWidth -
      getTitleBlockWidth(combinations) -
      getMinBlockWidth(combinations, mini) -
      getMaxBlockWidth(combinations, mini),
    1,
  )
}

const serializeBoxPlot = function ({
  combination,
  combination: { quantiles },
  minAll,
  maxAll,
  width,
  mini,
}) {
  const titleBlock = getTitleBlock(combination, mini)

  if (!isMeasuredCombination(combination)) {
    return titleBlock
  }

  const minBlock = getMinBlock(quantiles, mini)
  const content = getContent({ quantiles, minAll, maxAll, mini, width })
  const maxBlock = getMaxBlock(quantiles, mini)
  return concatBlocks([titleBlock, minBlock, content, maxBlock])
}

// When the combination has not been measured yet
const isMeasuredCombination = function ({ quantiles }) {
  return quantiles !== undefined
}

// Retrieve sidebar with the combination name
const getTitleBlock = function (combination, mini) {
  const titleBlockContents = getTitleBlockContents(combination)
  const bottomNewlines = getBottomNewlines(mini)
  return `${titleBlockContents}\n${bottomNewlines}`
}

const getTitleBlockWidth = function ([combination]) {
  return stringWidth(getTitleBlockContents(combination))
}

const getTitleBlockContents = function (combination) {
  return `${getCombinationNameColor(combination)}${NAME_SEPARATOR_COLORED}`
}

const getBottomNewlines = function (mini) {
  const bottomNewlinesHeight = mini ? 0 : LABELS_HEIGHT
  return '\n'.repeat(bottomNewlinesHeight)
}

const LABELS_HEIGHT = 1

// Retrieve the blocks that show the lowest|highest value of the histogram, on
// the left|right of it
const getBlock = function (getStat, quantiles, mini) {
  return mini ? '' : getStat(quantiles)
}

// Retrieve the width of those blocks
const getBlockWidth = function (getStat, combinations, mini) {
  return mini
    ? 0
    : Math.max(
        ...combinations.map((combination) =>
          getCombinationWidth(combination, getStat),
        ),
      )
}

const getCombinationWidth = function ({ quantiles }, getStat) {
  return stringWidth(getStat(quantiles))
}

const getMinStat = function ({ min: { prettyPaddedColor } }) {
  return `${PADDING}${prettyPaddedColor}${PADDING}`
}

const getMaxStat = function ({ max: { prettyPaddedColor } }) {
  return `${PADDING}${prettyPaddedColor}${PADDING}`
}

const PADDING_WIDTH = 1
const PADDING = ' '.repeat(PADDING_WIDTH)

const getMinBlock = getBlock.bind(undefined, getMinStat)
const getMinBlockWidth = getBlockWidth.bind(undefined, getMinStat)
const getMaxBlock = getBlock.bind(undefined, getMaxStat)
const getMaxBlockWidth = getBlockWidth.bind(undefined, getMaxStat)

const getContent = function ({ quantiles, minAll, maxAll, width, mini }) {
  const positions = getPositions({ quantiles, minAll, maxAll, width })
  const box = getBox(positions, width)

  if (mini) {
    return box
  }

  const labels = getLabels(positions, width)
  return `${box}
${labels}`
}

const getPositions = function ({ quantiles, minAll, maxAll, width }) {
  return mapObj(quantiles, (name, stat) =>
    getPosition({ name, stat, minAll, maxAll, width }),
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
  width,
}) {
  const percentage = (raw - minAll) / (maxAll - minAll)
  const index = Math.min(Math.floor(percentage * width), width - 1)
  return [name, { prettyColor, length, index }]
}

// eslint-disable-next-line complexity, max-statements
const getBox = function ({ min, p25, median, p75, max }, width) {
  const leftSpaceWidth = min.index
  const leftSpace = ' '.repeat(leftSpaceWidth)
  const minCharacter = min.index === p25.index ? '' : MIN_CHARACTER
  const leftLineWidth = p25.index - min.index - minCharacter.length
  const leftLine =
    leftLineWidth <= 0 ? '' : LINE_CHARACTER.repeat(leftLineWidth)
  const p25BoxWidth = median.index - p25.index
  const p25Box = p25BoxWidth <= 0 ? '' : BOX_CHARACTER.repeat(p25BoxWidth)
  const medianCharacter = goodColor(MEDIAN_CHARACTER)
  const p75BoxWidth = p75.index - median.index
  const p75Box = p75BoxWidth <= 0 ? '' : BOX_CHARACTER.repeat(p75BoxWidth)
  const maxCharacter = p75.index === max.index ? '' : MAX_CHARACTER
  const rightLineWidth = max.index - p75.index - maxCharacter.length
  const rightLine =
    rightLineWidth <= 0 ? '' : LINE_CHARACTER.repeat(rightLineWidth)
  const rightSpaceWidth = width - max.index - 1
  const rightSpace = ' '.repeat(rightSpaceWidth)
  return `${leftSpace}${minCharacter}${leftLine}${p25Box}${medianCharacter}${p75Box}${rightLine}${maxCharacter}${rightSpace}`
}

// Works on most terminals
const MIN_CHARACTER = '\u251C'
const LINE_CHARACTER = '\u2500'
const BOX_CHARACTER = '\u2591'
const MEDIAN_CHARACTER = '\u2588'
const MAX_CHARACTER = '\u2524'

const getLabels = function ({ median }, width) {
  const medianLabelIndex = Math.min(
    Math.max(
      median.index - Math.max(Math.floor((median.length - 1) / 2), 0),
      0,
    ),
    width - median.length,
  )
  const medianLabelLeft = ' '.repeat(medianLabelIndex)
  return `${medianLabelLeft}${median.prettyColor}`
}

export const boxplot = { reportTerminal }
