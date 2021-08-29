import indentString from 'indent-string'

// Add left|top|bottom padding to terminal content
export const addPadding = function (block) {
  return `\n${indentBlock(block, PADDING_SIZE)}\n`
}

export const PADDING_SIZE = 1

// Indent a block of text to print in terminals
export const indentBlock = function (block, indentSize = DEFAULT_INDENT_SIZE) {
  return indentString(block, indentSize)
}

const DEFAULT_INDENT_SIZE = 2
