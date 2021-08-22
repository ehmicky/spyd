import { omitFooterProps } from '../report/contents/omit.js'
import { addFooterTitles } from '../report/contents/titles.js'
import { FORMATS } from '../report/formats/list.js'

import { serializeFooter } from './serialize.js'

export const handleFooter = function ({
  result,
  titles,
  showTitles,
  showMetadata,
  showSystem,
  format,
}) {
  const { result: resultA, footer } = initFooter(result)
  const footerA = addFooterTitles(footer, titles, showTitles)
  const footerB = omitFooterProps(footerA, showMetadata, showSystem)
  const footerC = serializeFooter(footerB, titles, showTitles)
  const resultB = addFooter(resultA, footerC, format)
  const footerD = stringifyFooter(footerC, format)
  return { result: resultB, footer: footerD }
}

const initFooter = function ({ id, timestamp, systems, ...result }) {
  return { result, footer: { id, timestamp, systems } }
}

// Depending on format, it is either passed to the reporter or appended by us.
const addFooter = function (result, footer, format) {
  return FORMATS[format].footer === undefined ? { ...result, footer } : result
}

const stringifyFooter = function (footer, format) {
  return FORMATS[format].footer === undefined || footer.length === 0
    ? ''
    : `\n${FORMATS[format].footer(footer)}\n`
}
