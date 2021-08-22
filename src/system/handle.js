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
  const footerB = serializeFooter(footerA, titles, showTitles)
  const footerC = omitFooterProps(footerB, showMetadata, showSystem)
  const footerD = cleanFooter(footerC)
  const resultB = addFooter(resultA, footerD, format)
  const footerE = stringifyFooter(footerD, format)
  return { result: resultB, footer: footerE }
}

const initFooter = function ({ id, timestamp, systems, ...result }) {
  return { result, footer: { id, timestamp, systems } }
}

const cleanFooter = function (footer) {
  return footer.filter(hasFields).map(normalizeDepth)
}

const hasFields = function ({ fields }) {
  return Object.keys(fields).length !== 0
}

const normalizeDepth = function ({ title, fields }) {
  return title === undefined ? fields : { [title]: fields }
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
