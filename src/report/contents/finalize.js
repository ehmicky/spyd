import stripFinalNewline from 'strip-final-newline'

import { groupBy } from '../../utils/group.js'
import { FORMATS } from '../formats/list.js'
import { getLineSeparator } from '../utils/line.js'

import { handleContent } from './handle.js'

// Remove empty contents, join them by output, fix colors and whitespaces
export const finalizeContents = function (contents) {
  const contentsA = contents.filter(hasContent)
  return Object.values(groupBy(contentsA, 'output'))
    .map(joinContents)
    .map(handleOutputContent)
}

// A reporter can choose not to return anything
const hasContent = function ({ content }) {
  return typeof content === 'string' && content !== ''
}

// Join all `contents` with the same `output`.
// Also add footer and padding.
const joinContents = function (contents) {
  const [{ output, format, colors, footerString }] = contents
  const joinSeparator = `\n${getLineSeparator()}\n`
  const content = contents.map(getContentProperty).join(joinSeparator)
  const contentA = `${content}${footerString}`
  return { content: contentA, output, format, colors }
}

const getContentProperty = function ({ content }) {
  return `${stripFinalNewline(content)}\n`
}

const handleOutputContent = function ({ content, output, format, colors }) {
  const padding = FORMATS[format].padding !== undefined
  const contentA = handleContent({ content, padding, colors })
  return { content: contentA, output }
}
