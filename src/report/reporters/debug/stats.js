import { fieldColor } from '../../utils/colors.js'
import { getCombinationNameColor } from '../../utils/name.js'
import { STAT_TITLES } from '../../utils/stat_titles.js'
import { getTables } from '../../utils/table/main.js'

// Retrieve all stats shown in tables
export const getStatTables = function (combinations, screenWidth) {
  const firstColumn = getFirstColumn(combinations)
  const columns = getColumns(combinations)
  return getTables({ firstColumn, columns, headerHeight: 1, screenWidth })
}

const getFirstColumn = function (combinations) {
  return combinations.map(getCombinationNameColor)
}

// Retrieved all `stats.*` properties that are not `undefined`, for the columns.
const getColumns = function (combinations) {
  return STAT_NAMES.map((statName) => getColumn(statName, combinations)).filter(
    columnHasAnyStat,
  )
}

// List of columns, with their `stats.*` property.
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

const getColumn = function (statName, combinations) {
  const headerNames = [fieldColor(STAT_TITLES[statName])]
  const cellStats = combinations.map(
    ({ stats: { [statName]: { prettyColor = '' } = {} } }) => prettyColor,
  )
  return { headerNames, cellStats }
}

const columnHasAnyStat = function ({ cellStats }) {
  return cellStats.some(Boolean)
}
