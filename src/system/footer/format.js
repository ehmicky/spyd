import { FORMATS } from '../../report/formats/list.js'

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

const arrifyFooter = function ({ Id, Timestamp, systems }) {
  const systemsA = systems.map(addTitle)
  return Id === undefined ? systemsA : [...systemsA, { Id, Timestamp }]
}

const addTitle = function ({ title, ...system }) {
  return title === undefined ? system : { [title]: system }
}
