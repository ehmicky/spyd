import { stderr } from 'process'
import { promisify } from 'util'
import { cursorTo, clearLine } from 'readline'

const pCursorTo = promisify(cursorTo)
const pClearLine = promisify(clearLine)

// Progress reporter only meant for debugging
// eslint-disable-next-line no-empty-function
const start = function() {}

const update = async function({ name, percentage, index, total }) {
  const percentageStr = serializePercentage(percentage)
  const indexStr = String(index + 1).padStart(String(total).length)
  const content = `${percentageStr} ${indexStr}/${total} ${name}`

  await clearProgress()

  try {
    await promisify(stderr.write.bind(stderr))(content)
  } catch {}
}

const serializePercentage = function(percentage) {
  const percentageInt = Math.round(percentage * FLOAT_TO_PERCENTAGE)
  return `${percentageInt}%`.padStart(PERCENTAGE_WIDTH)
}

const FLOAT_TO_PERCENTAGE = 1e2
const PERCENTAGE_WIDTH = 4

const stop = async function() {
  await clearProgress()
}

const clearProgress = async function() {
  try {
    await pCursorTo(stderr, 0, undefined)
    await pClearLine(stderr, 0)
  } catch {}
}

export const debug = { start, update, stop }
