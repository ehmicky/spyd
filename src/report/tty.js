import { stdin, stdout } from 'node:process'
import { clearScreenDown, cursorTo } from 'node:readline'
import { promisify } from 'node:util'

import isInteractive from 'is-interactive'

import { PADDING_SIZE } from './utils/indent.js'

const pCursorTo = promisify(cursorTo)
const pClearScreenDown = promisify(clearScreenDown)

// Print to stdout (tty or file)
export const printToStdout = async (string) => {
  // Happens for example when piping to `less` then aborting
  if (!stdout.writable) {
    return
  }

  await promisify(stdout.write.bind(stdout))(string)
}

// Clear terminal. Used in previews to refresh the screen.
export const clearScreen = async () => {
  await pCursorTo(stdout, 0, 0)
  await pClearScreenDown(stdout)
}

// Same as clearScreen but by printing newlines instead of moving the cursor.
// This allows keeping the previous terminal prompts.
// Should be done first, before switching to using `clearScreen()`.
export const clearScreenFull = async () => {
  const screenHeight = getScreenHeight()
  const newlines = '\n'.repeat(screenHeight - CLEAR_SCREEN_ROWS)
  await printToStdout(newlines)
}

// Ensure we don't remove the initial user prompt but still remove the
// "Starting..." message
const CLEAR_SCREEN_ROWS = 2

// When stdin is not a tty, we do not use preview by default.
// Many preview features depends on interactive input: keypress, scrolling.
export const isTtyInput = () => isInteractive({ stream: stdin })

// When stdout is not a tty, we do not use preview by default
export const isTtyOutput = () => isInteractive({ stream: stdout })

// Add screen size-related information.
// Not added to history results since this does not reflect the screen size when
// the history result was taken
export const addScreenInfo = (result) => {
  const screenWidth = getPaddedScreenWidth()
  const screenHeight = getPaddedScreenHeight()
  return { ...result, screenWidth, screenHeight }
}

// Retrieve terminal width, excluding the padding added to reporting
export const getPaddedScreenWidth = () =>
  Math.max(getScreenWidth() - PADDING_SIZE * 2, 1)

const getPaddedScreenHeight = () =>
  Math.max(getScreenHeight() - PADDING_SIZE * 2, 1)

// Retrieve terminal width and height
export const getScreenWidth = () => {
  const { columns = DEFAULT_WIDTH } = stdout
  return columns
}

export const getScreenHeight = () => {
  const { rows = DEFAULT_HEIGHT } = stdout
  return rows
}

// Used when the output is not a TTY
const DEFAULT_WIDTH = 80
const DEFAULT_HEIGHT = 25
