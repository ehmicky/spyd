import { goodColor, separatorColor } from '../../utils/colors.js'

// Retrieve the box plot
export const getBox = function ({
  positions: { min, q1, median, q3, max },
  minBlockWidth,
  combinationTitles,
  mini,
}) {
  const leftSpace = getLeftSpace(min, minBlockWidth, mini)
  const minPadded = getPaddedStat(min.prettyColor, mini)
  const minLine = getMinLine(min, q1)
  const q1Box = fillCharacter(BOX_CHARACTER, q1, median)
  const medianCharacter = goodColor(MEDIAN_CHARACTER)
  const q3Box = fillCharacter(BOX_CHARACTER, median, q3)
  const maxLine = getMaxLine(q3, max)
  const maxPadded = getPaddedStat(max.prettyColor, mini)
  return `${combinationTitles}${leftSpace}${minPadded}${minLine}${q1Box}${medianCharacter}${q3Box}${maxLine}${maxPadded}\n`
}

const getLeftSpace = function (min, minBlockWidth, mini) {
  const minWidth = getPaddedStat(min.pretty, mini).length
  const leftSpaceWidth = Math.max(minBlockWidth + min.index - minWidth, 0)
  return ' '.repeat(leftSpaceWidth)
}

const getMinLine = function (min, q1) {
  const leftLine = fillCharacter(LINE_CHARACTER, min, q1)
  const leftLineA =
    leftLine === '' ? leftLine : `${MIN_CHARACTER}${leftLine.slice(1)}`
  return separatorColor(leftLineA)
}

const getMaxLine = function (q3, max) {
  const rightLine = fillCharacter(LINE_CHARACTER, q3, max)
  const rightLineA =
    rightLine === '' ? rightLine : `${rightLine.slice(0, -1)}${MAX_CHARACTER}`
  return separatorColor(rightLineA)
}

const fillCharacter = function (character, start, end) {
  const width = Math.max(end.index - start.index, 0)
  return character.repeat(width)
}

// Works on most terminals
const MIN_CHARACTER = '\u251C'
const LINE_CHARACTER = '\u2500'
const BOX_CHARACTER = '\u2591'
const MEDIAN_CHARACTER = '\u2588'
const MAX_CHARACTER = '\u2524'

// Surround stats with padding
export const getPaddedStat = function (string, mini) {
  return mini ? '' : `${STAT_PADDING}${string}${STAT_PADDING}`
}

const STAT_PADDING_WIDTH = 1
const STAT_PADDING = ' '.repeat(STAT_PADDING_WIDTH)
