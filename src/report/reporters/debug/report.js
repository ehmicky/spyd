import { fieldColor } from '../../utils/colors.js'
import { getCombinationTitleColor } from '../../utils/combination_title.js'
import { STAT_TITLES } from '../../utils/stat_titles.js'
import { getTables } from '../../utils/table/main.js'

// Debugging reporter only meant for development purpose
export const reportTerminal = function (
  { combinations, screenWidth },
  {
    mini = false,
    sparse = false,
    header = true,
    stats: statNames = DEFAULT_STAT_NAMES,
  },
) {
  const statNamesA = getStatNames(combinations, statNames, sparse)
  const headerRows = getHeaderRow(statNamesA, mini, header)
  const bodyRows = getBodyRows(combinations, statNamesA)
  return getTables([...headerRows, ...bodyRows], screenWidth, mini)
}

// Order is significant as it is displayed in that order.
const DEFAULT_STAT_NAMES = [
  'mean',
  'meanMin',
  'meanMax',
  'median',
  'min',
  'max',
  'diff',
  'stdev',
  'rstdev',
  'moe',
  'rmoe',
  'cold',
  'outliersMin',
  'outliersMax',
  'times',
  'loops',
  'repeat',
  'samples',
  'envDev',
  'minLoopDuration',
  'runDuration',
]

// Retrieve the list of columns, each corresponding to a stat.
// Empty columns are not displayed.
const getStatNames = function (combinations, statNames, sparse) {
  return sparse
    ? statNames
    : statNames.filter((statName) => hasStat(combinations, statName))
}

const hasStat = function (combinations, statName) {
  return combinations.some(
    (combination) => getCell(statName, combination) !== '',
  )
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

const getCell = function (
  statName,
  { stats: { [statName]: { prettyColor = '' } = {} } },
) {
  return prettyColor
}
