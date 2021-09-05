/* eslint-disable max-lines */
import mapObj from 'map-obj'
import stringWidth from 'string-width'

import { padCenter } from '../../../utils/pad.js'
import { goodColor, fieldColor } from '../../utils/colors.js'
import { concatBlocks } from '../../utils/concat.js'
import { getCombinationNameColor } from '../../utils/name.js'
import { NAME_SEPARATOR_COLORED } from '../../utils/separator.js'
import { STAT_TITLES } from '../../utils/stat_titles.js'

// Reporter showing boxplot of measures (min, q1, median, q3, max)
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
    serializeBoxPlot({
      combination,
      minAll,
      maxAll,
      minBlockWidth,
      contentWidth,
      maxBlockWidth,
      mini,
    }),
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

const getMinMaxFullWidth = function (combinations, mini, statName) {
  return mini
    ? 0
    : Math.max(
        getHeaderNameWidth(statName),
        getMinMaxBlockWidth(combinations, statName),
      )
}

const getHeaderNameWidth = function (statName) {
  return getHeaderName(statName).length
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
  minBlockWidth,
  contentWidth,
  maxBlockWidth,
  mini,
}) {
  const titleBlock = getTitleBlock(combination, mini)

  if (quantiles === undefined) {
    return titleBlock
  }

  const blocks = getBlocks({
    quantiles,
    minAll,
    maxAll,
    minBlockWidth,
    contentWidth,
    maxBlockWidth,
    mini,
  })
  return concatBlocks([titleBlock, ...blocks])
}

const getBlocks = function ({
  quantiles,
  minAll,
  maxAll,
  minBlockWidth,
  contentWidth,
  maxBlockWidth,
  mini,
}) {
  if (mini) {
    const miniContent = getMiniContent({
      quantiles,
      minAll,
      maxAll,
      contentWidth,
    })
    return [miniContent]
  }

  const minBlock = getMinMaxBlock(quantiles, minBlockWidth, 'min')
  const fullContent = getFullContent({
    quantiles,
    minAll,
    maxAll,
    contentWidth,
  })
  const maxBlock = getMinMaxBlock(quantiles, maxBlockWidth, 'max')
  return [minBlock, fullContent, maxBlock]
}

const getTitleBlockWidth = function ([combination]) {
  return stringWidth(getTitleBlockContents(combination))
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
  return addPadding(quantiles[statName].prettyPadded).length
}

// Retrieve the blocks that show the min|max on the left|right
const getMinMaxBlock = function (quantiles, blockWidth, statName) {
  const paddingWidth = Math.max(
    blockWidth - getPaddedMinMaxWidth(quantiles, statName),
    0,
  )
  const padding = ' '.repeat(paddingWidth)
  const statValue = addPadding(quantiles[statName].prettyPaddedColor)
  return `${padding}${statValue}`
}

const PADDING_WIDTH = 1
const PADDING = ' '.repeat(PADDING_WIDTH)

const addPadding = function (string) {
  return `${PADDING}${string}${PADDING}`
}

const getFullContent = function ({ quantiles, minAll, maxAll, contentWidth }) {
  const positions = getPositions({ quantiles, minAll, maxAll, contentWidth })
  const box = getBox(positions, contentWidth)
  const labels = getLabels(positions, contentWidth)
  return `${box}
${labels}`
}

const getMiniContent = function ({ quantiles, minAll, maxAll, contentWidth }) {
  const positions = getPositions({ quantiles, minAll, maxAll, contentWidth })
  const box = getBox(positions, contentWidth)
  return box
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
const getBox = function ({ min, q1, median, q3, max }, contentWidth) {
  const leftSpaceWidth = min.index
  const leftSpace = ' '.repeat(leftSpaceWidth)
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
  const rightSpaceWidth = contentWidth - max.index - 1
  const rightSpace = ' '.repeat(rightSpaceWidth)
  return `${leftSpace}${minCharacter}${leftLine}${q1Box}${medianCharacter}${q3Box}${rightLine}${maxCharacter}${rightSpace}`
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
