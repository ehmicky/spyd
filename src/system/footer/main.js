import { FORMATS } from '../../report/formats/list.js'
import { addFooterTitles } from '../../report/normalize/titles_add.js'
import { omitFooterProps } from '../omit.js'

import { arrifyFooter } from './arrify.js'
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
  const footerG = arrifyFooter(footerF)
  const { footerParams, footerString } = applyFooterFormat(footerG, format)
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
