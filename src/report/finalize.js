import stripAnsi from 'strip-ansi'
import stripFinalNewline from 'strip-final-newline'

import { groupBy } from '../utils/group.js'

import { FORMATS } from './formats/list.js'
import { addPadding } from './utils/indent.js'
import { wrapRows } from './utils/wrap.js'

// Remove empty contents, join them by output, fix colors and whitespaces
export const finalizeContents = function (contents) {
  const contentsA = contents.filter(hasContent)
  const contentsB = Object.values(groupBy(contentsA, 'output')).map(
    joinContents,
  )
  return contentsB
}

// A reporter can choose not to return anything
const hasContent = function ({ content }) {
  return typeof content === 'string' && content.trim() !== ''
}

// Join all `contents` with the same `output`.
// Also add footer and padding.
const joinContents = function (contents) {
  const [{ output, format, colors, footerString }] = contents
  const contentsString = contents.map(getContentProperty).join('\n')
  const contentsStringA = `${contentsString}${footerString}`
  const contentsStringB = handleContent(contentsStringA, format, colors)
  return { contentsString: contentsStringB, output }
}

const getContentProperty = function ({ content }) {
  return content
}

// Handle content returned by `reporter.report()`.
// We purposely do not remove empty lines before/after the `content` since those
// might be used to avoid vertical jitter when the reporter knows those empty
// lines will be eventually filled (e.g. when combinations stats become
// available).
const handleContent = function (content, format, colors) {
  const contentA = handleColors(content, colors)
  const contentB = trimEnd(contentA)
  const contentC = wrapRows(contentB)
  const contentD = padContents(contentC, format)
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

const padContents = function (joinedContents, format) {
  if (FORMATS[format].padding === undefined) {
    return joinedContents
  }

  const joinedContentsA = `${stripFinalNewline(joinedContents)}\n`
  return addPadding(joinedContentsA)
}
