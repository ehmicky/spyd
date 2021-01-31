import { stdout } from 'process'

import isInteractive from 'is-interactive'
import stripAnsi from 'strip-ansi'

import { addPadding } from './utils/indent.js'

// Since `report()` might have side effects such as making a HTTP call, we make
// sure it is called exactly once.
// Interactive output/terminal have different default values for some report
// config properties, so we compute two different contents: TTY and not TTY.
export const getNonTtyContents = function (contents) {
  return contents.map(getNonTtyContent).join(CONTENTS_DELIMITER)
}

export const getTtyContents = function (contents) {
  return addPadding(contents.map(getTtyContent).join(CONTENTS_DELIMITER))
}

const getNonTtyContent = function ({ content, colors = false }) {
  return getContent(content, colors)
}

const getTtyContent = function ({ content, colors = isInteractive(stdout) }) {
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

// It is possible to use "output" or "insert" with multiple reporters at once
const CONTENTS_DELIMITER = '\n'
