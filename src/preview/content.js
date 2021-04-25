import { getScreenWidth } from '../report/tty.js'
import { goodColor, separatorColor } from '../report/utils/colors.js'

// Retrieve preview content.
// The `counter` is between `durationLeft` and `progressBar` so that there is
// no empty space when `durationLeft` is unknown.
export const getPreviewContent = function ({
  report,
  durationLeft,
  percentage,
  index,
  total,
  description = '',
}) {
  const screenWidth = getScreenWidth()
  const leftWidth = getLeftWidth(durationLeft, total)
  const results = getResults(report, screenWidth)
  const counter = getCounter(index, total)
  const progressBar = getProgressBar({
    durationLeft,
    counter,
    percentage,
    screenWidth,
  })

  return `${results}
 ${durationLeft.padEnd(leftWidth)}  ${progressBar}

 ${counter.padEnd(leftWidth)}  ${description}
`
}

const getLeftWidth = function (durationLeft, total) {
  return Math.max(durationLeft.length, getCounter(total, total).length)
}

// `report` is `undefined` when all reporters have `reporter.quiet: true`.
const getResults = function (report, screenWidth) {
  if (report === undefined) {
    return ''
  }

  const separator = separatorColor(LINE_CHAR.repeat(screenWidth))
  return `${report}${separator}\n`
}

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
const LINE_CHAR = separatorColor('\u2500')
