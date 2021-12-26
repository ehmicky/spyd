import { FORMATS } from '../../report/formats/list.js'
import { addFooterTitles } from '../../report/normalize/titles_add.js'
import { omitFooterProps } from '../omit.js'

import { serializeFooter } from './serialize.js'
import { addSharedSystems } from './shared/main.js'

// Add each `reporter.footer`
// TODO:
//  - use `addSharedSystems()` then `sortSystems()`
//  - this logic should come after `serialize.js`, i.e. there are no deep
//    properties and all properties values are strings
//     - However, the `system.title` logic should be moved after it
//  - fix `title` logic:
//     - transform each id string into { id: string, title: string }
//     - add `system.title`
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
  const footerA = addFooterTitles(footer, titles, showTitles)
  const footerB = omitFooterProps(footerA, showMetadata, showSystem)
  const footerC = addSharedSystems(footerB)
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
