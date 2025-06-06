import { fieldColor } from '../../utils/colors.js'
import { getCombinationTitleColor } from '../../utils/combination_title.js'
import { STAT_TITLES } from '../../utils/stat_titles.js'
import { getTables } from '../../utils/table/main.js'

import { getCell, getStatNames } from './stats.js'

// Debugging reporter only meant for development purpose
export const reportTerminal = (
  { combinations, screenWidth },
  { mini, sparse, header, stats: statNames },
) => {
  const statNamesA = getStatNames(combinations, statNames, sparse)
  const headerRows = getHeaderRow(statNamesA, mini, header)
  const bodyRows = getBodyRows(combinations, statNamesA)
  return getTables([...headerRows, ...bodyRows], screenWidth, mini)
}

const getHeaderRow = (statNames, mini, header) => {
  if (!header) {
    return []
  }

  const firstRow =
    statNames.length === 0 ? [] : ['', ...statNames.map(getHeaderName)]
  return mini ? [firstRow] : [firstRow, []]
}

const getHeaderName = (statName) => fieldColor(STAT_TITLES[statName])

const getBodyRows = (combinations, statNames) =>
  combinations.map((combination) => getBodyRow(combination, statNames))

const getBodyRow = (combination, statNames) => {
  const leftCell = getCombinationTitleColor(combination)
  const rightCells = statNames.map((statName) => getCell(statName, combination))
  return [leftCell, ...rightCells]
}
