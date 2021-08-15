import { concatContents } from './concat.js'
import { FORMATS } from './format.js'
import { addPadding } from './utils/indent.js'

// Serialize `contents` to a string
export const serializeContents = function (contents) {
  if (contents.length === 0) {
    return ''
  }

  const [{ format }] = contents
  const joinedContents = concatContents(contents.map(getContentProperty))
  const contentsString = padContents(joinedContents, format)
  return contentsString
}

const getContentProperty = function ({ content }) {
  return content
}

const padContents = function (joinedContents, format) {
  return FORMATS[format].padding ? addPadding(joinedContents) : joinedContents
}
