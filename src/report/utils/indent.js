import indentString from 'indent-string'

// Indent a block of text to print in terminals
export const indentBlock = function (block) {
  return indentString(block, INDENT_SIZE)
}

const INDENT_SIZE = 2
