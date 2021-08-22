import { omitFooterProps } from '../report/contents/omit.js'
import { addSystemsTitles } from '../report/contents/titles.js'

import { serializeFooter } from './serialize.js'

export const handleFooter = function ({
  result,
  titles,
  showTitles,
  showMetadata,
  showSystem,
  keepFooter,
}) {
  const resultA = addSystemsTitles(result, titles, showTitles)
  const resultB = serializeFooter(resultA, titles, showTitles)
  const resultC = omitFooterProps(resultB, showMetadata, showSystem)
  const { result: resultD, footer } = finalizeFooter(resultC, keepFooter)
  return { result: resultD, footer }
}

// Depending on format, it is either passed to the reporter or appended by us.
const finalizeFooter = function ({ footer, ...result }, keepFooter) {
  const footerA = footer.filter(hasFields).map(normalizeDepth)
  const resultA = keepFooter ? { ...result, footer: footerA } : result
  return { result: resultA, footer: footerA }
}

const hasFields = function ({ fields }) {
  return Object.keys(fields).length !== 0
}

const normalizeDepth = function ({ title, fields }) {
  return title === undefined ? fields : { [title]: fields }
}
