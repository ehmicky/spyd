import { getFooter } from '../../utils/footer/main.js'
import { getHistograms } from '../../utils/histogram/main.js'
import { joinSections } from '../../utils/join.js'
import { prettifyValue } from '../../utils/prettify_value.js'
import { prettifyStats } from '../../utils/stats/main.js'
import { addTitles } from '../../utils/title/main.js'

import { getHeader } from './header.js'
import { getRow } from './row.js'

// Debugging reporter only meant for development purpose
const report = function ({ id, timestamp, systems, combinations }) {
  const combinationsA = prettifyStats(combinations)
  const combinationsB = addTitles(combinationsA)

  const table = getTable(combinationsB)
  const histograms = getHistograms(combinationsB)
  const footer = prettifyValue(getFooter({ id, timestamp, systems }))
  return joinSections([table, ...histograms, footer])
}

const getTable = function (combinations) {
  const header = getHeader(combinations[0])
  const rows = combinations.map(getRow)
  return [header, ...rows].join('\n')
}

export const dev = { report }
