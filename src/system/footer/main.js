import { addFooterTitles } from '../../report/normalize/titles_add.js'
import { omitFooterProps } from '../omit.js'

import { applyFooterFormat } from './format.js'
import { serializeFooter } from './serialize.js'
import { addSharedSystems } from './shared/main.js'
import { sortSystems } from './sort/main.js'
import { addSystemsTitles } from './title.js'

// Add each `reporter.footer`
// TODO:
//  - fix `PROP_ORDER` with real order (use one from `serialize.js`)
//     - dynamic properties should be sorted normally
//  - [SPYD_VERSION_NAME] should always be in shared system, using the latest
//    system's value
//  - Debug through this function, one step at a time
export const addFooter = function ({
  result: { id, system },
  resultProps: { timestamp },
  mergedResult: { systems = [system] } = {},
  reporter,
  reporter: {
    format,
    config: { showTitles, showMetadata, showSystem },
  },
  config: { titles },
}) {
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
