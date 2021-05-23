import stripAnsi from 'strip-ansi'

import { isTtyOutput } from './tty.js'
import { addPadding } from './utils/indent.js'

// Since `report()` might have side effects such as making a HTTP call, we make
// sure it is called exactly once.
export const getFileContents = function (contents) {
  return contents.map(getFileContent).join(CONTENTS_DELIMITER)
}

export const getStdoutContents = function (contents) {
  return addPadding(contents.map(getStdoutContent).join(CONTENTS_DELIMITER))
}

const getFileContent = function ({ content, colors = false }) {
  return getContent(content, colors)
}

const getStdoutContent = function ({ content, colors = isTtyOutput() }) {
  return getContent(content, colors)
}

// Reporters should always assume `colors` are true, but the core remove this
// from the returned content if not.
const getContent = function (content, colors) {
  const contentA = handleColors(content, colors)
  const contentB = trimContent(contentA)
  return contentB
}

// Strip colors from reporters output if `colors` config property is false
const handleColors = function (content, colors) {
  if (colors) {
    return content
  }

  return stripAnsi(content)
}

// Ensure that exactly one newline is before and after the content
const trimContent = function (content) {
  const contentA = content.replace(NEWLINE_REGEXP, '')
  return `${contentA}\n`
}

const NEWLINE_REGEXP = /(^\n*)|(\n*$)/gu

// It is possible to use "output" with multiple reporters at once
const CONTENTS_DELIMITER = '\n'
