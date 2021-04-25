import { getScreenWidth } from '../report/tty.js'
import { goodColor, separatorColor } from '../report/utils/colors.js'
import { addPadding, PADDING_SIZE } from '../report/utils/indent.js'

// Retrieve preview content.
// `report` is `undefined` when all reporters have `reporter.quiet: true`.
export const getPreviewContent = function ({
  report = '',
  durationLeft,
  percentage,
  index,
  total,
  combinationName,
  description,
}) {
  const screenWidth = getScreenWidth()
  const separator = getSeparator(report, screenWidth)
  const previewLines = getPreviewLines({
    durationLeft,
    percentage,
    index,
    total,
    combinationName,
    description,
    screenWidth,
  })
  return `${report}${separator}${previewLines}\n`
}

const getSeparator = function (report, screenWidth) {
  if (report === '') {
    return ''
  }

  return separatorColor(`${LINE_CHAR.repeat(screenWidth)}\n`)
}

// Works with all terminals
const LINE_CHAR = separatorColor('\u2500')

const getPreviewLines = function ({
  durationLeft,
  percentage,
  index,
  total,
  combinationName,
  description,
  screenWidth,
}) {
  const leftWidth = getLeftWidth(durationLeft, total)
  const durationLeftA = durationLeft.padEnd(leftWidth)
  const progressBar = getProgressBar(durationLeftA, percentage, screenWidth)
  const counter = getCounter(index, total).padEnd(leftWidth)
  const descriptionA = getDescription(description)

  return addPadding(`${durationLeftA}${progressBar}

${counter}${combinationName}${descriptionA}`)
}

const getLeftWidth = function (durationLeft, total) {
  return (
    Math.max(durationLeft.length, getCounter(total, total).length) +
    LEFT_WIDTH_PADDING
  )
}

const LEFT_WIDTH_PADDING = 2

// The `counter` is between `durationLeft` and `progressBar` so that there is
// no empty space when `durationLeft` is unknown.
const getCounter = function (index, total) {
  return `(${index + 1}/${total})`
}

const getProgressBar = function (durationLeft, percentage, screenWidth) {
  const progressBarWidth = screenWidth - PADDING_SIZE * 2 - durationLeft.length
  const filled = Math.floor(progressBarWidth * percentage)
  const filledChars = FILL_CHAR.repeat(filled)
  const voidedChars = VOID_CHAR.repeat(progressBarWidth - filled)
  return `${filledChars}${voidedChars}`
}

// Works with all terminals
const FILL_CHAR = goodColor('\u2588')
const VOID_CHAR = separatorColor('\u2591')

const getDescription = function (description) {
  if (description === '') {
    return ''
  }

  return separatorColor(`  (${description})`)
}
