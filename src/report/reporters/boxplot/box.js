import { goodColor } from '../../utils/colors.js'

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
  const leftLineWidth = Math.max(q1.index - min.index - minCharacter.length, 0)
  const leftLine = LINE_CHARACTER.repeat(leftLineWidth)
  const q1BoxWidth = Math.max(median.index - q1.index, 0)
  const q1Box = BOX_CHARACTER.repeat(q1BoxWidth)
  const medianCharacter = goodColor(MEDIAN_CHARACTER)
  const q3BoxWidth = Math.max(q3.index - median.index, 0)
  const q3Box = BOX_CHARACTER.repeat(q3BoxWidth)
  const maxCharacter = q3.index === max.index ? '' : MAX_CHARACTER
  const rightLineWidth = Math.max(max.index - q3.index - maxCharacter.length, 0)
  const rightLine = LINE_CHARACTER.repeat(rightLineWidth)
  const maxPadded = mini ? '' : addStatPadding(max.prettyColor)
  return `${combinationTitles}${leftSpace}${minPadded}${minCharacter}${leftLine}${q1Box}${medianCharacter}${q3Box}${rightLine}${maxCharacter}${maxPadded}\n`
}

// Works on most terminals
const MIN_CHARACTER = '\u251C'
const LINE_CHARACTER = '\u2500'
const BOX_CHARACTER = '\u2591'
const MEDIAN_CHARACTER = '\u2588'
const MAX_CHARACTER = '\u2524'

// Surround stats with padding
export const addStatPadding = function (string) {
  return `${STAT_PADDING}${string}${STAT_PADDING}`
}

const STAT_PADDING_WIDTH = 1
const STAT_PADDING = ' '.repeat(STAT_PADDING_WIDTH)
