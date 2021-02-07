import { stdout } from 'process'
import { cursorTo, clearScreenDown } from 'readline'
import { promisify } from 'util'

import isInteractive from 'is-interactive'

const pCursorTo = promisify(cursorTo)
const pClearScreenDown = promisify(clearScreenDown)

// When stdout is a tty, we use preview by default
export const isTtyOutput = function () {
  return isInteractive(stdout)
}

export const getScreenWidth = function () {
  const { columns = DEFAULT_WIDTH } = stdout
  return columns
}

export const getScreenHeight = function () {
  const { rows = DEFAULT_HEIGHT } = stdout
  return rows
}

// Used when the output is not a TTY
const DEFAULT_WIDTH = 80
const DEFAULT_HEIGHT = 25

export const printToTty = async function (string) {
  // Happens for example when piping to `less` then aborting
  if (stdout.destroyed) {
    return
  }

  await promisify(stdout.write.bind(stdout))(string)
}

export const clearScreen = async function () {
  await pCursorTo(stdout, 0, 0)
  await pClearScreenDown(stdout)
}
