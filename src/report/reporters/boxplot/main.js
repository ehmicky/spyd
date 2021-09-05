/* eslint-disable max-lines */
import mapObj from 'map-obj'
import stringWidth from 'string-width'

import { padCenter } from '../../../utils/pad.js'
import { goodColor, fieldColor } from '../../utils/colors.js'
import { concatBlocks } from '../../utils/concat.js'
import { getCombinationNameColor } from '../../utils/name.js'
import { NAME_SEPARATOR_COLORED } from '../../utils/separator.js'
import { STAT_TITLES } from '../../utils/stat_titles.js'

// Reporter showing boxplot of measures (min, p25, median, p75, max)
const reportTerminal = function (
  { combinations, screenWidth },
  { mini = false },
) {
  const combinationsA = combinations.map(normalizeQuantiles)
  const { minAll, maxAll } = getMinMaxAll(combinationsA)
  const { titleBlockWidth, minBlockWidth, contentWidth, maxBlockWidth } =
    getWidths(combinationsA, screenWidth, mini)
  const header = getHeader({
    mini,
    titleBlockWidth,
    minBlockWidth,
    contentWidth,
    maxBlockWidth,
  })
  const rows = combinationsA.map((combination) =>
    serializeBoxPlot({ combination, minAll, maxAll, contentWidth, mini }),
  )
  return [...header, ...rows].join('\n')
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

const getWidths = function (combinations, screenWidth, mini) {
  const titleBlockWidth = stringWidth(getTitleBlockContents(combinations[0]))
  const minBlockWidth = mini
    ? 0
    : Math.max(
        getHeaderName('min').length,
        getMinMaxBlockWidth(combinations, 'min'),
      )
  const maxBlockWidth = mini
    ? 0
    : Math.max(
        getHeaderName('max').length,
        getMinMaxBlockWidth(combinations, 'max'),
      )
  const contentWidth = Math.max(
    screenWidth - titleBlockWidth - minBlockWidth - maxBlockWidth,
    1,
  )
  return { titleBlockWidth, minBlockWidth, contentWidth, maxBlockWidth }
}

const getHeader = function ({
  mini,
  titleBlockWidth,
  minBlockWidth,
  contentWidth,
  maxBlockWidth,
}) {
  if (mini) {
    return []
  }

  const titleHeader = ' '.repeat(titleBlockWidth)
  const minHeader = padHeaderField(getHeaderName('min'), minBlockWidth)
  const boxHeader = padHeaderField(getHeaderName('median'), contentWidth)
  const maxHeader = padHeaderField(getHeaderName('max'), maxBlockWidth)
  return [`${titleHeader}${minHeader}${boxHeader}${maxHeader}`]
}

const getHeaderName = function (statName) {
  return addPadding(STAT_TITLES[statName])
}

const padHeaderField = function (headerName, headerWidth) {
  const paddedHeader = padCenter(headerName, headerWidth)
  return fieldColor(paddedHeader)
}

const serializeBoxPlot = function ({
  combination,
  combination: { quantiles },
  minAll,
  maxAll,
  contentWidth,
  mini,
}) {
  const titleBlock = getTitleBlock(combination, mini)

  if (!isMeasuredCombination(combination)) {
    return titleBlock
  }

  const minBlock = getMinMaxBlock(quantiles, 'min', mini)
  const content = getContent({ quantiles, minAll, maxAll, mini, contentWidth })
  const maxBlock = getMinMaxBlock(quantiles, 'max', mini)
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

const getTitleBlockContents = function (combination) {
  return `${getCombinationNameColor(combination)}${NAME_SEPARATOR_COLORED}`
}

const getBottomNewlines = function (mini) {
  const bottomNewlinesHeight = mini ? 0 : LABELS_HEIGHT
  return '\n'.repeat(bottomNewlinesHeight)
}

const LABELS_HEIGHT = 1

// Retrieve the blocks that show the min|max on the left|right
const getMinMaxBlock = function (quantiles, statName, mini) {
  return mini ? '' : getStat(quantiles, statName)
}

// Retrieve the width of those blocks
const getMinMaxBlockWidth = function (combinations, statName) {
  const combinationsA = combinations.filter(isMeasuredCombination)
  return combinationsA.length === 0
    ? 0
    : Math.max(
        ...combinationsA.map((combination) =>
          getCombinationWidth(combination, statName),
        ),
      )
}

const getCombinationWidth = function ({ quantiles }, statName) {
  return stringWidth(getStat(quantiles, statName))
}

const getStat = function (quantiles, statName) {
  return addPadding(quantiles[statName].prettyPaddedColor)
}

const PADDING_WIDTH = 1
const PADDING = ' '.repeat(PADDING_WIDTH)

const addPadding = function (string) {
  return `${PADDING}${string}${PADDING}`
}

const getContent = function ({
  quantiles,
  minAll,
  maxAll,
  contentWidth,
  mini,
}) {
  const positions = getPositions({ quantiles, minAll, maxAll, contentWidth })
  const box = getBox(positions, contentWidth)

  if (mini) {
    return box
  }

  const labels = getLabels(positions, contentWidth)
  return `${box}
${labels}`
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
const getBox = function ({ min, p25, median, p75, max }, contentWidth) {
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
  const rightSpaceWidth = contentWidth - max.index - 1
  const rightSpace = ' '.repeat(rightSpaceWidth)
  return `${leftSpace}${minCharacter}${leftLine}${p25Box}${medianCharacter}${p75Box}${rightLine}${maxCharacter}${rightSpace}`
}

// Works on most terminals
const MIN_CHARACTER = '\u251C'
const LINE_CHARACTER = '\u2500'
const BOX_CHARACTER = '\u2591'
const MEDIAN_CHARACTER = '\u2588'
const MAX_CHARACTER = '\u2524'

const getLabels = function ({ median }, contentWidth) {
  const medianLabelIndex = Math.min(
    Math.max(
      median.index - Math.max(Math.floor((median.length - 1) / 2), 0),
      0,
    ),
    contentWidth - median.length,
  )
  const medianLabelLeft = ' '.repeat(medianLabelIndex)
  return `${medianLabelLeft}${median.prettyColor}`
}

export const boxplot = { reportTerminal }
