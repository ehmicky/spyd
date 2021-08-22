import stripAnsi from 'strip-ansi'

import { wrapRows } from '../utils/wrap.js'

// Handle content returned by `reporter.report()`
export const handleContent = function ({
  content,
  output,
  format,
  colors,
  footerString,
}) {
  const contentA = trimEnd(content)
  const contentB = wrapRows(contentA)
  const contentC = handleColors(contentB, colors)
  const contentD = trimContent(contentC)
  return { content: contentD, output, format, footerString }
}

// Trim the end of each line to avoid wrapping-related visual bugs
const trimEnd = function (content) {
  return content.split('\n').map(trimEndLine).join('\n')
}

const trimEndLine = function (line) {
  return line.trimEnd()
}

// Reporters should always assume `colors` are true, but the core remove this
// from the returned content if not.
const handleColors = function (content, colors) {
  return colors ? content : stripAnsi(content)
}

// Ensure that exactly one newline is before and after the content
const trimContent = function (content) {
  const contentA = content.replace(NEWLINE_REGEXP, '')
  return `${contentA}\n`
}

const NEWLINE_REGEXP = /(^\n*)|(\n*$)/gu
