import { stderr } from 'process'
import { cursorTo, clearLine } from 'readline'
import { promisify } from 'util'

import { noteColor } from '../../report/utils/colors.js'

const pCursorTo = promisify(cursorTo)
const pClearLine = promisify(clearLine)

// Progress reporter only meant for debugging
// eslint-disable-next-line no-empty-function
const start = function () {}

const update = async function ({ percentage, timeLeft }) {
  const percentageStr = serializePercentage(percentage)
  const content = ` ${timeLeft} ${noteColor(percentageStr)}`

  await clearProgress()

  try {
    await promisify(stderr.write.bind(stderr))(content)
  } catch {}
}

const serializePercentage = function (percentage) {
  const percentageInt = Math.floor(percentage * FLOAT_TO_PERCENTAGE)
  return `${percentageInt}%`.padStart(PERCENTAGE_WIDTH)
}

const FLOAT_TO_PERCENTAGE = 1e2
const PERCENTAGE_WIDTH = 4

const stop = async function () {
  await clearProgress()
}

const clearProgress = async function () {
  try {
    await pCursorTo(stderr, 0)
    await pClearLine(stderr, 0)
  } catch {}
}

export const debug = { start, update, stop }
