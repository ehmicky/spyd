import { goodColor, separatorColor } from '../../utils/colors.js'

// Retrieve the box plot
export const getBox = ({
  positions: { min, q1, median, q3, max },
  minBlockWidth,
  combinationTitles,
  mini,
}) => {
  // Empty space before the box plot
  const leftSpace = getLeftSpace(min, minBlockWidth, mini)
  // `min` stat number
  const minPadded = getPaddedStat(min.prettyColor, mini)
  // Line on the start of the box plot
  const minLine = separatorColor(getMinLine(min, q1))
  // First half of the inter-quartile range
  const q1Box = fillCharacter(BOX_CHARACTER, q1, median)
  // Single character for the median
  const medianCharacter = goodColor(MEDIAN_CHARACTER)
  // Second half of the inter-quartile range
  const q3Box = fillCharacter(BOX_CHARACTER, median, q3)
  // Line on the end of the box plot
  const maxLine = separatorColor(getMaxLine(q3, max))
  // `max` stat number
  const maxPadded = getPaddedStat(max.prettyColor, mini)
  return `${combinationTitles}${leftSpace}${minPadded}${minLine}${q1Box}${medianCharacter}${q3Box}${maxLine}${maxPadded}\n`
}

const getLeftSpace = (min, minBlockWidth, mini) => {
  const minWidth = getPaddedStat(min.pretty, mini).length
  return repeatCharacter(' ', minBlockWidth + min.index - minWidth)
}

const getMinLine = (min, q1) => {
  const leftLine = fillCharacter(HORIZONTAL_LINE, min, q1)
  return leftLine === '' ? leftLine : `${MIN_CHARACTER}${leftLine.slice(1)}`
}

const getMaxLine = (q3, max) => {
  const rightLine = fillCharacter(HORIZONTAL_LINE, q3, max)
  return rightLine === ''
    ? rightLine
    : `${rightLine.slice(0, -1)}${MAX_CHARACTER}`
}

const fillCharacter = (character, start, end) =>
  repeatCharacter(character, end.index - start.index)

const repeatCharacter = (character, width) =>
  character.repeat(Math.max(width, 0))

// Works on most terminals
const MIN_CHARACTER = '\u251C'
const HORIZONTAL_LINE = '\u2500'
const BOX_CHARACTER = '\u2591'
const MEDIAN_CHARACTER = '\u2588'
const MAX_CHARACTER = '\u2524'

// Surround stats with padding
const getPaddedStat = (string, mini) =>
  mini ? '' : `${STAT_PADDING}${string}${STAT_PADDING}`

export const getPaddedStatLength = (string) =>
  string.length + STAT_PADDING_WIDTH * 2

const STAT_PADDING_WIDTH = 1
const STAT_PADDING = ' '.repeat(STAT_PADDING_WIDTH)
