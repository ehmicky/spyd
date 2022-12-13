// Retrieve the list of columns, each corresponding to a stat.
// Empty columns are not displayed.
export const getStatNames = (combinations, statNames, sparse) =>
  sparse
    ? statNames
    : statNames.filter((statName) => hasStat(combinations, statName))

const hasStat = (combinations, statName) =>
  combinations.some((combination) => getCell(statName, combination) !== '')

// Retrieve a single cell
export const getCell = (
  statName,
  { stats: { [statName]: { prettyColor = '' } = {} } },
) => prettyColor

// All available stats. Also the default value.
export const ALL_STAT_NAMES = [
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
export const EXAMPLE_STAT_NAMES = ['mean', 'median']
export const EXAMPLE_STAT_NAME = 'median'
