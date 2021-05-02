import { getFooter } from '../../utils/footer/main.js'
import { serializeHistograms } from '../../utils/histogram/main.js'
import { joinSections } from '../../utils/join.js'
import { prettifyValue } from '../../utils/prettify_value.js'
import { prettifyStats } from '../../utils/stats/main.js'
import { addTitles } from '../../utils/title.js'

import { getHeader } from './header.js'
import { getRow } from './row.js'
import { getAllStatNames } from './stats.js'

// Debugging reporter only meant for development purpose
const report = function ({
  id,
  timestamp,
  systems,
  combinations,
  screenWidth,
}) {
  const combinationsA = prettifyStats(combinations)
  const combinationsB = addTitles(combinationsA)

  const allStatNames = getAllStatNames(combinationsB[0], screenWidth)
  const tables = allStatNames.map((statNames) =>
    getTable(combinationsB, statNames),
  )
  const histograms = serializeHistograms(combinationsB, HISTOGRAM_OPTS)
  const footer = prettifyValue(getFooter({ id, timestamp, systems }))
  return joinSections([...tables, ...histograms, footer])
}

const getTable = function (combinations, statNames) {
  const header = getHeader(combinations[0], statNames)
  const rows = combinations.map((combination) => getRow(combination, statNames))
  return [header, ...rows].join('\n')
}

const HISTOGRAM_OPTS = { showStats: false }

export const debug = { report }
