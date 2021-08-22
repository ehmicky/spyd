import { omitFooterProps } from '../report/contents/omit.js'
import { addFooterTitles } from '../report/contents/titles.js'
import { FORMATS } from '../report/formats/list.js'

import { serializeFooter } from './serialize.js'

export const handleFooters = function ({
  result: { id, timestamp, systems, ...result },
  titles,
  reporters,
}) {
  const reportersA = reporters.map((reporter) =>
    handleFooter({ id, timestamp, systems, titles, reporter }),
  )
  return { result, reporters: reportersA }
}

const handleFooter = function ({
  id,
  timestamp,
  systems,
  titles,
  reporter,
  reporter: {
    format,
    config: { showTitles, showMetadata, showSystem },
  },
}) {
  const footer = { id, timestamp, systems }
  const footerA = addFooterTitles(footer, titles, showTitles)
  const footerB = omitFooterProps(footerA, showMetadata, showSystem)
  const footerC = serializeFooter(footerB)
  const { footerParam, footerString } = applyFooterFormat(footerC, format)
  return { ...reporter, footerParam, footerString }
}

// Depending on the format, the footer is either:
//  - Appended as a string to the reporter's contents
//  - Passed as an array to `reporter.report*()`
const applyFooterFormat = function (footer, format) {
  const normalizeFooter = FORMATS[format].footer

  if (normalizeFooter === undefined) {
    return { footerParams: { footer }, footerString: '' }
  }

  const footerString =
    footer.length === 0 ? '' : `\n${normalizeFooter(footer)}\n`
  return { footerParams: {}, footerString }
}
