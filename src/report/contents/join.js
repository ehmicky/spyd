import { groupBy } from '../../utils/group.js'
import { FORMATS } from '../format.js'
import { addPadding } from '../utils/indent.js'

import { concatContents } from './concat.js'

// Join all `contents` with the same `output`
export const joinByOutput = function (contents) {
  return Object.values(groupBy(contents, 'output')).map(joinContents)
}

const joinContents = function (contents) {
  const [{ output, format }] = contents
  const joinedContents = concatContents(contents.map(getContentProperty))
  const contentsString = padContents(joinedContents, format)
  return { contentsString, output }
}

const getContentProperty = function ({ content }) {
  return content
}

const padContents = function (joinedContents, format) {
  return FORMATS[format].padding ? addPadding(joinedContents) : joinedContents
}
