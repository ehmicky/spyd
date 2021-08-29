import stripFinalNewline from 'strip-final-newline'

import { groupBy } from '../utils/group.js'

import { FORMATS } from './formats/list.js'
import { addPadding } from './utils/indent.js'

// Join all `contents` with the same `output`.
// Also add footer and padding.
export const joinByOutput = function (contents) {
  return Object.values(groupBy(contents, 'output')).map(joinContents)
}

const joinContents = function (contents) {
  const [{ output, format, footerString }] = contents
  const contentsString = contents
    .map(getContentProperty)
    .join(CONTENTS_DELIMITER)
  const contentsStringA = `${contentsString}${footerString}`
  const contentsStringB = padContents(contentsStringA, format)
  return { contentsString: contentsStringB, output }
}

const getContentProperty = function ({ content }) {
  return content
}

const CONTENTS_DELIMITER = '\n'

const padContents = function (joinedContents, format) {
  if (FORMATS[format].padding === undefined) {
    return joinedContents
  }

  const joinedContentsA = `${stripFinalNewline(joinedContents)}\n`
  return addPadding(joinedContentsA)
}
