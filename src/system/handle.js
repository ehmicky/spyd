import { omitFooterProps } from '../report/contents/omit.js'
import { addSystemsTitles } from '../report/contents/titles.js'

import { finalizeFooter } from './finalize.js'
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
