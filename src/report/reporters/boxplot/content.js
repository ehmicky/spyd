import mapObj from 'map-obj'

import { goodColor } from '../../utils/colors.js'

import { addStatPadding } from './pad.js'

// Compute the horizontal position on the screen of each quantile
export const getPositions = function ({
  quantiles,
  minAll,
  maxAll,
  contentWidth,
}) {
  return mapObj(quantiles, (name, stat) =>
    getPosition({ name, stat, minAll, maxAll, contentWidth }),
  )
}

const getPosition = function ({
  name,
  stat: { raw, pretty, prettyColor },
  minAll,
  maxAll,
  contentWidth,
}) {
  const percentage = (raw - minAll) / (maxAll - minAll)
  const index = Math.min(
    Math.floor(percentage * contentWidth),
    contentWidth - 1,
  )
  return [name, { pretty, prettyColor, index }]
}

// Retrieve the box plot
// eslint-disable-next-line complexity, max-statements
export const getBox = function ({
  positions: { min, q1, median, q3, max },
  minBlockWidth,
  combinationTitles,
  mini,
}) {
  const leftSpaceWidth = Math.max(
    minBlockWidth + min.index - (mini ? 0 : addStatPadding(min.pretty).length),
    0,
  )
  const leftSpace = ' '.repeat(leftSpaceWidth)
  const minPadded = mini ? '' : addStatPadding(min.prettyColor)
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
  const maxPadded = mini ? '' : addStatPadding(max.prettyColor)
  return `${combinationTitles}${leftSpace}${minPadded}${minCharacter}${leftLine}${q1Box}${medianCharacter}${q3Box}${rightLine}${maxCharacter}${maxPadded}\n`
}

// Works on most terminals
const MIN_CHARACTER = '\u251C'
const LINE_CHARACTER = '\u2500'
const BOX_CHARACTER = '\u2591'
const MEDIAN_CHARACTER = '\u2588'
const MAX_CHARACTER = '\u2524'

// Retrieve the median label line shown below the box plot
export const getLabels = function ({
  positions: { median },
  titlesWidth,
  minBlockWidth,
  contentWidth,
}) {
  const leftShift = Math.max(Math.floor((median.pretty.length - 1) / 2), 0)
  const shiftedIndex = median.index - leftShift
  const maxContentIndex = contentWidth - median.pretty.length
  const contentIndex = Math.min(Math.max(shiftedIndex, 0), maxContentIndex)
  const labelIndex = contentIndex + titlesWidth + minBlockWidth
  const labelLeft = ' '.repeat(labelIndex)
  return `${labelLeft}${median.prettyColor}\n`
}
