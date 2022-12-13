import { getPaddedScreenWidth } from '../../../report/tty.js'
import { goodColor, separatorColor } from '../../../report/utils/colors.js'

// Retrieve row with progress bar
export const getProgressRow = ({ durationLeft, percentage, leftWidth }) => {
  const durationLeftA = durationLeft.padEnd(leftWidth)
  const progressBar = getProgressBar(durationLeftA, percentage)
  return `${durationLeftA}${progressBar}\n`
}

const getProgressBar = (durationLeft, percentage) => {
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
