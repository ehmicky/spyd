import { omitFooterProps } from '../report/contents/omit.js'
import { addFooterTitles } from '../report/contents/titles.js'

import { serializeFooter } from './serialize.js'

export const handleFooter = function ({
  result,
  titles,
  showTitles,
  showMetadata,
  showSystem,
  keepFooter,
}) {
  const { result: resultA, footer } = initFooter(result)
  const footerA = addFooterTitles(footer, titles, showTitles)
  const footerB = serializeFooter(footerA, titles, showTitles)
  const footerC = omitFooterProps(footerB, showMetadata, showSystem)
  const footerD = cleanFooter(footerC)
  const resultB = addFooter(resultA, footerD, keepFooter)
  return { result: resultB, footer: footerD }
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
const addFooter = function (result, footer, keepFooter) {
  return keepFooter ? { ...result, footer } : result
}
