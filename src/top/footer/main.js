import { addFooterTitles } from '../../report/normalize/titles_add.js'
import { omitFooterProps } from '../omit.js'

import { applyFooterFormat } from './format.js'
import { serializeFooter } from './serialize.js'
import { addSharedSystems } from './shared/main.js'
import { sortSystems } from './sort/main.js'
import { addSystemsTitles } from './title.js'

// Add each `reporter.footer`
export const computeFooter = ({
  result: { id },
  systems,
  timestamp,
  reporter,
  reporter: {
    config: { format, showTitles, showMetadata, showSystem },
  },
  config: { titles },
}) => {
  const footer = { id, timestamp, systems }
  const footerA = omitFooterProps(footer, showMetadata, showSystem)
  const footerB = serializeFooter(footerA)
  const footerC = addSharedSystems(footerB)
  const footerD = sortSystems(footerC)
  const footerE = addFooterTitles(footerD, titles, showTitles)
  const footerF = addSystemsTitles(footerE)
  const { footerParams, footerString } = applyFooterFormat(footerF, format)
  return { ...reporter, footerParams, footerString }
}
