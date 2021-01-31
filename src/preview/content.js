import { stderr } from 'process'

import { goodColor, noteColor } from '../report/utils/colors.js'

// Retrieve preview content
export const getContent = function ({ percentage, time, description, report }) {
  const progressBar = getProgressBar(percentage, time)
  const descriptionStr = getDescription(description)
  return [report, ` ${time}${progressBar}${descriptionStr}`]
    .filter(Boolean)
    .join('\n\n')
}

const getProgressBar = function (percentage, time) {
  if (percentage === undefined) {
    return ''
  }

  const screenWidth = getScreenWidth(stderr)
  const width = screenWidth - time.length - PADDING_WIDTH
  const filled = Math.floor(width * percentage)
  const filledChars = FILL_CHAR.repeat(filled)
  const voidedChars = VOID_CHAR.repeat(width - filled)
  return `  ${filledChars}${voidedChars}`
}

const getScreenWidth = function ({ columns = DEFAULT_WIDTH }) {
  return columns
}

// Used when the output is not a TTY
const DEFAULT_WIDTH = 80
// Pad the left|right of the progress bar with spaces
const PADDING_WIDTH = 5

// Works on Windows CP437
const FILL_CHAR = goodColor('\u2588')
const VOID_CHAR = noteColor('\u2591')

const getDescription = function (description) {
  if (description === undefined) {
    return ''
  }

  return `\n\n  ${description}`
}
