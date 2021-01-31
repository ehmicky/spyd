import { stdout } from 'process'

import isInteractive from 'is-interactive'
import stripAnsi from 'strip-ansi'

// Since `report()` might have side effects such as making a HTTP call, we make
// sure it is called exactly once.
// Interactive output/terminal have different default values for some report
// config properties, so we compute two different contents: interactive and
// non-interactive.
export const getNonInteractiveContent = function (content, colors = false) {
  return getContent(content, colors)
}

export const getInteractiveContent = function (
  content,
  colors = isInteractive(stdout),
) {
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

// A reporter can choose not to return anything, in which case `output` and
// `insert` are not used.
export const hasContent = function (content) {
  return typeof content === 'string' && content.trim() !== ''
}
