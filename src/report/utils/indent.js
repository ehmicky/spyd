import indentString from 'indent-string'

// Indent a block of text to print in terminals
export const indentBlock = function (block) {
  return indentString(block, INDENT_SIZE)
}

const INDENT_SIZE = 2

// Add left|top|bottom padding to terminal content
export const addPadding = function (block) {
  return `\n${indentString(block, PADDING_SIZE)}\n`
}

const PADDING_SIZE = 1
