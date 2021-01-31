import { stderr } from 'process'

import { goodColor, separatorColor } from '../report/utils/colors.js'

// Retrieve preview content.
export const getContent = function ({
  percentage,
  time,
  description = '',
  report,
}) {
  const screenWidth = getScreenWidth(stderr)
  const results = getResults(report, screenWidth)
  const progressBar = getProgressBar({ percentage, time, screenWidth })

  return `${results}
 ${time}${progressBar}

 ${description}
`
}

const getScreenWidth = function ({ columns = DEFAULT_WIDTH }) {
  return columns
}

// Used when the output is not a TTY
const DEFAULT_WIDTH = 80

// `report` is `undefined` when all reporters have `reporter.quiet: true`.
const getResults = function (report, screenWidth) {
  if (report === undefined) {
    return ''
  }

  const separator = separatorColor(LINE_CHAR.repeat(screenWidth))
  return `${report}${separator}\n`
}

const getProgressBar = function ({ percentage, time, screenWidth }) {
  if (percentage === undefined) {
    return ''
  }

  const width = screenWidth - time.length - PADDING_WIDTH
  const filled = Math.floor(width * percentage)
  const filledChars = FILL_CHAR.repeat(filled)
  const voidedChars = VOID_CHAR.repeat(width - filled)
  return `  ${filledChars}${voidedChars}`
}

// Pad the left|right of the progress bar with spaces
const PADDING_WIDTH = 4

// Works on Windows CP437
const FILL_CHAR = goodColor('\u2588')
const VOID_CHAR = separatorColor('\u2591')
const LINE_CHAR = separatorColor('\u2500')
