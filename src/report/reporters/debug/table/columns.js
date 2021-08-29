import { NON_TRIMMABLE_SPACE } from '../../../utils/space.js'
import { STAT_TITLES } from '../../../utils/stat_titles.js'

// Retrieved all `stats.*` properties that are not `undefined`, for the columns.
export const getColumns = function (combinations) {
  const columns = STAT_NAMES.map((statName) =>
    getColumn(statName, combinations),
  ).filter(columnHasAnyStat)
  return columns.length === 0 ? EMPTY_COLUMNS : columns
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
  const headerNames = [STAT_TITLES[statName]]
  const cellStats = combinations.map(({ stats }) => stats[statName])
  return { headerNames, cellStats }
}

const columnHasAnyStat = function ({ cellStats }) {
  return cellStats.some(Boolean)
}

const EMPTY_COLUMNS = [{ headerNames: [NON_TRIMMABLE_SPACE], cellStats: [] }]
