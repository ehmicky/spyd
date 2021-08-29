import stripAnsi from 'strip-ansi'

import { joinByOutput } from './join.js'
import { wrapRows } from './utils/wrap.js'

// Transform `contents` to `contentString`s
export const finalizeContents = function (contents) {
  const contentsA = contents.filter(hasContent).map(handleContent)
  const contentsB = joinByOutput(contentsA)
  return contentsB
}

// A reporter can choose not to return anything
const hasContent = function ({ content }) {
  return typeof content === 'string' && content.trim() !== ''
}

// Handle content returned by `reporter.report()`.
// We purposely do not remove empty lines before/after the `content` since those
// might be used to avoid vertical jitter when the reporter knows those empty
// lines will be eventually filled (e.g. when combinations stats become
// available).
const handleContent = function ({
  content,
  output,
  format,
  colors,
  footerString,
}) {
  const contentA = trimEnd(content)
  const contentB = wrapRows(contentA)
  const contentC = handleColors(contentB, colors)
  return { content: contentC, output, format, footerString }
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
