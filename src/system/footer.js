import { FORMATS } from '../report/formats/list.js'
import { addFooterTitles } from '../report/normalize/titles.js'

import { omitFooterProps } from './omit.js'
import { serializeFooter } from './serialize.js'
import { addSharedSystem } from './shared.js'

// Add each `reporter.footer`
export const addFooter = function ({
  result: { id, timestamp, system },
  mergedResult: { systems = [system] } = {},
  reporter,
  reporter: {
    format,
    config: { showTitles, showMetadata, showSystem },
  },
  config: { titles },
}) {
  const footer = { id, timestamp, systems }
  const footerA = addFooterTitles(footer, titles, showTitles)
  const footerB = omitFooterProps(footerA, showMetadata, showSystem)
  const footerC = addSharedSystem(footerB)
  const footerD = serializeFooter(footerC)
  const { footerParams, footerString } = applyFooterFormat(footerD, format)
  return { ...reporter, footerParams, footerString }
}

// Depending on the format, the footer is either:
//  - Appended as a string to the reporter's contents
//  - Passed as an array to `reporter.report*()`
const applyFooterFormat = function (footer, format) {
  const normalizeFooter = FORMATS[format].footer

  if (normalizeFooter === undefined) {
    return { footerParams: { footer }, footerString: '' }
  }

  const footerString = footer.length === 0 ? '' : normalizeFooter(footer)
  return { footerParams: {}, footerString }
}
