import { groupBy } from '../../utils/group.js'
import { FORMATS } from '../formats/list.js'
import { addPadding } from '../utils/indent.js'

// Join all `contents` with the same `output`.
// Also add footer and padding.
export const joinByOutput = function (contents) {
  return Object.values(groupBy(contents, 'output')).map(joinContents)
}

const joinContents = function (contents) {
  const [{ output, format, footer }] = contents
  const contentsString = contents
    .map(getContentProperty)
    .join(CONTENTS_DELIMITER)
  const contentsStringA = addFooter(contentsString, footer, format)
  const contentsStringB = padContents(contentsStringA, format)
  return { contentsString: contentsStringB, output }
}

const getContentProperty = function ({ content }) {
  return content
}

const CONTENTS_DELIMITER = '\n'

const addFooter = function (contentsString, footer, format) {
  const {
    [format]: { footer: normalizeFooter },
  } = FORMATS
  return normalizeFooter === undefined || footer.length === 0
    ? contentsString
    : `${contentsString}\n${normalizeFooter(footer)}\n`
}

const padContents = function (joinedContents, format) {
  return FORMATS[format].padding ? addPadding(joinedContents) : joinedContents
}
