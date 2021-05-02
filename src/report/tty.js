import { stdin, stdout } from 'process'
import { cursorTo, clearScreenDown } from 'readline'
import { promisify } from 'util'

import isInteractive from 'is-interactive'

import { PADDING_SIZE } from './utils/indent.js'

const pCursorTo = promisify(cursorTo)
const pClearScreenDown = promisify(clearScreenDown)

// Print to interactive stdout
export const printToTty = async function (string) {
  // Happens for example when piping to `less` then aborting
  if (!stdout.writable) {
    return
  }

  await promisify(stdout.write.bind(stdout))(string)
}

// Clear terminal. Used in previews to refresh the screen.
export const clearScreen = async function () {
  await pCursorTo(stdout, 0, 0)
  await pClearScreenDown(stdout)
}

// Same as clearScreen but by printing newlines instead of moving the cursor.
// This allows keeping the previous terminal prompts.
// Should be done first, before switching to using `clearScreen()`.
export const clearScreenFull = async function () {
  const screenHeight = getScreenHeight()
  const newlines = '\n'.repeat(screenHeight - 2)
  await printToTty(newlines)
}

// When stdin is not a tty, we do not use preview by default.
// Many preview features depends on interactive input: keypress, scrolling.
export const isTtyInput = function () {
  return isInteractive({ stream: stdin })
}

// When stdout is not a tty, we do not use preview by default
export const isTtyOutput = function () {
  return isInteractive({ stream: stdout })
}

// Retrieve terminal width, excluding the padding added to reporting
export const getReportWidth = function () {
  return getScreenWidth() - PADDING_SIZE * 2
}

// Retrieve terminal width, excluding the padding added to reporting
export const getPaddedScreenWidth = function () {
  return Math.min(getScreenWidth() - PADDING_SIZE * 2, 1)
}

export const getPaddedScreenHeight = function () {
  return Math.min(getScreenHeight() - PADDING_SIZE * 2, 1)
}

// Retrieve terminal width and height
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
