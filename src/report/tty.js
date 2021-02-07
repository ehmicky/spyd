import { stdout } from 'process'
import { cursorTo, clearScreenDown } from 'readline'
import { promisify } from 'util'

import isInteractive from 'is-interactive'

const pCursorTo = promisify(cursorTo)
const pClearScreenDown = promisify(clearScreenDown)

// Print to interactive stdout
export const printToTty = async function (string) {
  // Happens for example when piping to `less` then aborting
  if (stdout.destroyed) {
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
  const newlines = '\n'.repeat(screenHeight - 1)
  await printToTty(newlines)
}

// When stdout is a tty, we use preview by default
export const isTtyOutput = function () {
  return isInteractive(stdout)
}

// Retrieve terminal width and height
export const getScreenWidth = function () {
  const { columns = DEFAULT_WIDTH } = stdout
  return columns
}

const getScreenHeight = function () {
  const { rows = DEFAULT_HEIGHT } = stdout
  return rows
}

// Used when the output is not a TTY
const DEFAULT_WIDTH = 80
const DEFAULT_HEIGHT = 25
