import { FORMATS } from '../../report/formats/list.js'
import { cleanObject } from '../../utils/clean.js'

// Depending on the format, the footer is either:
//  - Appended as a string to the reporter's contents
//  - Passed as an array to `reporter.report*()`
export const applyFooterFormat = function (footer, format) {
  const footerA = arrifyFooter(footer)
  const normalizeFooter = FORMATS[format].footer

  if (normalizeFooter === undefined) {
    return { footerParams: { footer: footerA }, footerString: '' }
  }

  const footerString = footerA.length === 0 ? '' : normalizeFooter(footerA)
  return { footerParams: {}, footerString }
}

// Turn footer into an array of objects:
//  - Each object is meant to be visually separate from the other, for example
//    with a newline
//  - Each object has either one or two depth levels and the values are strings
// This format means the `footer()` method of each format does not need to
// know the meaning of the footer, only how to print this simple structure.
const arrifyFooter = function ({ Id, Merge, Timestamp, systems }) {
  return [...systems.map(addTitle), { Id, Merge, Timestamp }]
    .map(cleanObject)
    .filter(hasProps)
}

const addTitle = function ({ title, props }) {
  return title === '' ? props : { [title]: props }
}

const hasProps = function (props) {
  return Object.keys(props).length !== 0
}
