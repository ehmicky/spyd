import { platform } from 'process'

import indentString from 'indent-string'

// Indent a block of text to print in terminals
export const indentBlock = function (block) {
  return indentString(block, INDENT_SIZE)
}

const INDENT_SIZE = 2

// Add left|top|bottom padding to terminal content
export const addPadding = function (block) {
  return `\n${addSmallIndent(block)}${FINAL_NEWLINE}`
}

export const addSmallIndent = function (block) {
  return indentString(block, PADDING_SIZE)
}

export const PADDING_SIZE = 1

// Terminals on Windows adds an additional newline
const FINAL_NEWLINE = platform === 'win32' ? '' : '\n'
