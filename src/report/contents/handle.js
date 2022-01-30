// TODO: use `util.stripVTControlCharacters()` after dropping support for
// Node <16.11.0
import stripAnsi from 'strip-ansi'

import { addPadding } from '../utils/indent.js'
import { wrapRows } from '../utils/wrap.js'

// Handle content returned by `reporter.report()`.
// Also used on the preview bottom bar.
// We purposely do not remove empty lines before/after the `content` since those
// might be used to avoid vertical jitter when the reporter knows those empty
// lines will be eventually filled (e.g. when combinations stats become
// available).
export const handleContent = function ({ content, padding, colors }) {
  const contentA = handleColors(content, colors)
  const contentB = trimEnd(contentA)
  const contentC = wrapRows(contentB)
  const contentD = padContents(contentC, padding)
  return contentD
}

// Reporters should always assume `colors` are true, but the core remove this
// from the returned content if not.
const handleColors = function (content, colors) {
  return colors ? content : stripAnsi(content)
}

// Trim the end of each line to avoid wrapping-related visual bugs
const trimEnd = function (content) {
  return content.split('\n').map(trimEndLine).join('\n')
}

const trimEndLine = function (line) {
  return line.trimEnd()
}

const padContents = function (joinedContents, padding) {
  return padding ? addPadding(joinedContents) : joinedContents
}
