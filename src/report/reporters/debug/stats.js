import { fieldColor } from '../../utils/colors.js'
import { getCombinationNameColor } from '../../utils/name.js'
import { STAT_TITLES } from '../../utils/stat_titles.js'
import { getTables } from '../../utils/table.js'

// Retrieve all stats shown in tables
export const getStatsTables = function (combinations, screenWidth) {
  const statNames = getStatNames(combinations)
  const headerRow = getHeaderRow(statNames)
  const bodyRows = getBodyRows(combinations, statNames)
  return getTables([headerRow, ...bodyRows], screenWidth)
}

// Retrieve the list of columns, each corresponding to a stat.
// Empty columns are not displayed.
const getStatNames = function (combinations) {
  return STAT_NAMES.filter((statName) => hasStat(combinations, statName))
}

// Order is significant as it is displayed in that order.
const STAT_NAMES = [
  'median',
  'medianMin',
  'medianMax',
  'mean',
  'min',
  'max',
  'diff',
  'stdev',
  'rstdev',
  'moe',
  'rmoe',
  'times',
  'loops',
  'repeat',
  'samples',
  'minLoopDuration',
]

const hasStat = function (combinations, statName) {
  return combinations.some(
    (combination) => getCell(statName, combination) !== '',
  )
}

const getHeaderRow = function (statNames) {
  return statNames.length === 0 ? [] : ['', ...statNames.map(getHeaderName)]
}

const getHeaderName = function (statName) {
  return fieldColor(STAT_TITLES[statName])
}

const getBodyRows = function (combinations, statNames) {
  return combinations.map((combination) => getBodyRow(combination, statNames))
}

const getBodyRow = function (combination, statNames) {
  const leftCell = getCombinationNameColor(combination)
  const rightCells = statNames.map((statName) => getCell(statName, combination))
  return [leftCell, ...rightCells]
}

const getCell = function (
  statName,
  { stats: { [statName]: { prettyColor = '' } = {} } },
) {
  return prettyColor
}
