import { getScreenWidth } from '../report/tty.js'
import { goodColor, separatorColor } from '../report/utils/colors.js'
import { addPadding } from '../report/utils/indent.js'

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
  const counter = getCounter(index, total)
  const progressBar = getProgressBar({
    durationLeft,
    counter,
    percentage,
    screenWidth,
  })
  const descriptionA = getDescription(description)

  return addPadding(`${durationLeft.padEnd(leftWidth)}  ${progressBar}

${counter.padEnd(leftWidth)}  ${combinationName}${descriptionA}`)
}

const getLeftWidth = function (durationLeft, total) {
  return Math.max(durationLeft.length, getCounter(total, total).length)
}

// The `counter` is between `durationLeft` and `progressBar` so that there is
// no empty space when `durationLeft` is unknown.
const getCounter = function (index, total) {
  return `(${index + 1}/${total})`
}

const getProgressBar = function ({
  durationLeft,
  counter,
  percentage,
  screenWidth,
}) {
  const width =
    screenWidth - durationLeft.length - counter.length - PADDING_WIDTH
  const filled = Math.floor(width * percentage)
  const filledChars = FILL_CHAR.repeat(filled)
  const voidedChars = VOID_CHAR.repeat(width - filled)
  return `${filledChars}${voidedChars}`
}

// Pad the left|right of the progress bar with spaces
const PADDING_WIDTH = 4
// Works with all terminals
const FILL_CHAR = goodColor('\u2588')
const VOID_CHAR = separatorColor('\u2591')

const getDescription = function (description) {
  if (description === '') {
    return ''
  }

  return separatorColor(`  (${description})`)
}
