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
  const q1Box = getQ1Box(q1, median)
  const medianCharacter = goodColor(MEDIAN_CHARACTER)
  const q3Box = getQ3Box(median, q3)
  const maxLine = getMaxLine(q3, max)
  const maxPadded = getPaddedStat(max.prettyColor, mini)
  return `${combinationTitles}${leftSpace}${minPadded}${minLine}${q1Box}${medianCharacter}${q3Box}${maxLine}${maxPadded}\n`
}

const getLeftSpace = function (min, minBlockWidth, mini) {
  const leftSpaceWidth = Math.max(
    minBlockWidth + min.index - getPaddedStat(min.pretty, mini).length,
    0,
  )
  return ' '.repeat(leftSpaceWidth)
}

const getMinLine = function (min, q1) {
  const minCharacter = min.index === q1.index ? '' : MIN_CHARACTER
  const leftLineWidth = Math.max(q1.index - min.index - minCharacter.length, 0)
  const leftLine = LINE_CHARACTER.repeat(leftLineWidth)
  return separatorColor(`${minCharacter}${leftLine}`)
}

const getQ1Box = function (q1, median) {
  return fillCharacter(BOX_CHARACTER, q1, median)
}

const getQ3Box = function (median, q3) {
  return fillCharacter(BOX_CHARACTER, median, q3)
}

const fillCharacter = function (character, start, end) {
  const width = Math.max(end.index - start.index, 0)
  return character.repeat(width)
}

const getMaxLine = function (q3, max) {
  const maxCharacter = q3.index === max.index ? '' : MAX_CHARACTER
  const rightLineWidth = Math.max(max.index - q3.index - maxCharacter.length, 0)
  const rightLine = LINE_CHARACTER.repeat(rightLineWidth)
  return separatorColor(`${rightLine}${maxCharacter}`)
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
