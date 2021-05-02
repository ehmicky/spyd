import { goodColor, separatorColor, noteColor } from '../report/utils/colors.js'
import { addPadding, PADDING_SIZE } from '../report/utils/indent.js'

// At the moment, this is static, but this might need to become dynamic in the
// future. This includes the separator and padding.
export const BOTTOM_BAR_HEIGHT = 7

// Retrieve bottom bar of preview
export const getBottomBar = function (previewState, screenWidth) {
  const separator = getSeparator(previewState, screenWidth)
  const leftWidth = getLeftWidth(previewState)
  const progressRow = getProgressRow(previewState, { screenWidth, leftWidth })
  const counterRow = getCounterRow(previewState, leftWidth)
  const bottom = getPreviewBottom(previewState, {
    screenWidth,
    leftWidth,
    progressRow,
    counterRow,
  })
  return `${separator}${bottom}`
}

const getSeparator = function ({ report }, screenWidth) {
  if (report === undefined) {
    return ''
  }

  return separatorColor(`${LINE_CHAR.repeat(screenWidth)}\n`)
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

const getPreviewBottom = function (
  { actions },
  { leftWidth, progressRow, counterRow },
) {
  const actionsA = getActions(actions, leftWidth)
  return addPadding(`${progressRow}\n\n${counterRow}\n\n${actionsA}`)
}

const getProgressRow = function (
  { durationLeft, percentage },
  { screenWidth, leftWidth },
) {
  const durationLeftA = durationLeft.padEnd(leftWidth)
  const progressBar = getProgressBar(durationLeftA, percentage, screenWidth)
  return `${durationLeftA}${progressBar}`
}

const getProgressBar = function (durationLeft, percentage, screenWidth) {
  const progressBarWidth = screenWidth - PADDING_SIZE * 2 - durationLeft.length
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
  return `${counter}${combinationName}${descriptionA}`
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

// Show keys available for user actions in previews.
// When there are no actions available, we keep an empty line to:
//  - Avoid jitter
//  - Simplify scrolling logic since remove the actions row might change whether
//    scrolling can be used, which can show the scrolling action, which can add
//    that actions row back
const getActions = function (actions, leftWidth) {
  const actionValues = Object.values(actions)

  if (actionValues.length === 0) {
    return ''
  }

  const actionsStr = actionValues.map(getAction).join(noteColor(', '))
  return `${ACTIONS_LABEL.padEnd(leftWidth)}${actionsStr}`
}

const getAction = function ({ key, explanation }) {
  return `${goodColor(key)} ${noteColor(`(${explanation})`)}`
}

export const ACTIONS_LABEL = 'Actions'
