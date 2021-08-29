import { getScreenWidth, getPaddedScreenWidth } from '../../../../report/tty.js'
import {
  goodColor,
  separatorColor,
  noteColor,
  titleColor,
} from '../../../../report/utils/colors.js'
import { wrapPaddedRows } from '../../../../report/utils/wrap.js'

import { ACTIONS_LABEL } from './bottom_bar.js'

// Retrieve elements of bottom bar in preview.
// Since the scrolling action must be computed twice, this is a performance
// optimization to avoid computing those elements twice.
export const getBottomBarElements = function (previewState) {
  const leftWidth = getLeftWidth(previewState)
  const separator = getSeparator(previewState)
  const progressRow = getProgressRow(previewState, leftWidth)
  const counterRow = getCounterRow(previewState, leftWidth)
  return { leftWidth, separator, progressRow, counterRow }
}

const getSeparator = function ({ report }) {
  if (report === undefined) {
    return ''
  }

  const screenWidth = getScreenWidth()
  return `${separatorColor(LINE_CHAR.repeat(screenWidth))}\n`
}

// Works with all terminals
const LINE_CHAR = '\u2500'

const getLeftWidth = function ({ durationLeft, total }) {
  return (
    Math.max(
      durationLeft.length,
      getCounter(total, total).length,
      ACTIONS_LABEL.length,
    ) + LEFT_WIDTH_PADDING
  )
}

const LEFT_WIDTH_PADDING = 2

const getProgressRow = function ({ durationLeft, percentage }, leftWidth) {
  const durationLeftA = durationLeft.padEnd(leftWidth)
  const progressBar = getProgressBar(durationLeftA, percentage)
  return `${durationLeftA}${progressBar}`
}

const getProgressBar = function (durationLeft, percentage) {
  const progressBarWidth = getPaddedScreenWidth() - durationLeft.length
  const filled = Math.floor(progressBarWidth * percentage)
  const filledChars = goodColor(FILL_CHAR.repeat(filled))
  const voidedChars = separatorColor(
    VOID_CHAR.repeat(progressBarWidth - filled),
  )
  return `${filledChars}${voidedChars}`
}

// Works with all terminals
const FILL_CHAR = '\u2588'
const VOID_CHAR = '\u2591'

const getCounterRow = function (
  { index, total, combinationName, description },
  leftWidth,
) {
  const counter = getCounter(index, total).padEnd(leftWidth)
  const descriptionA = getDescription(description, combinationName)
  return wrapPaddedRows(
    `${counter}${titleColor(combinationName)}${descriptionA}`,
  )
}

// The `counter` is between `durationLeft` and `progressBar` so that there is
// no empty space when `durationLeft` is unknown.
const getCounter = function (index, total) {
  return `(${index + 1}/${total})`
}

const getDescription = function (description, combinationName) {
  if (description === '') {
    return ''
  }

  const descriptionA =
    combinationName === '' ? description : `  (${description})`
  return noteColor(descriptionA)
}
