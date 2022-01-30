import { fieldColor } from '../../utils/colors.js'
import { getCombinationTitleColor } from '../../utils/combination_title.js'
import { STAT_TITLES } from '../../utils/stat_titles.js'
import { getTables } from '../../utils/table/main.js'

import { getStatNames, getCell } from './stats.js'

// Debugging reporter only meant for development purpose
export const reportTerminal = function (
  { combinations, screenWidth },
  { mini, sparse, header, stats: statNames },
) {
  const statNamesA = getStatNames(combinations, statNames, sparse)
  const headerRows = getHeaderRow(statNamesA, mini, header)
  const bodyRows = getBodyRows(combinations, statNamesA)
  return getTables([...headerRows, ...bodyRows], screenWidth, mini)
}

const getHeaderRow = function (statNames, mini, header) {
  if (!header) {
    return []
  }

  const firstRow =
    statNames.length === 0 ? [] : ['', ...statNames.map(getHeaderName)]
  return mini ? [firstRow] : [firstRow, []]
}

const getHeaderName = function (statName) {
  return fieldColor(STAT_TITLES[statName])
}

const getBodyRows = function (combinations, statNames) {
  return combinations.map((combination) => getBodyRow(combination, statNames))
}

const getBodyRow = function (combination, statNames) {
  const leftCell = getCombinationTitleColor(combination)
  const rightCells = statNames.map((statName) => getCell(statName, combination))
  return [leftCell, ...rightCells]
}
