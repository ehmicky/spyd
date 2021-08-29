import { getTables } from '../common/main.js'

import { getColumns } from './columns.js'

// Retrieve all stats shown in tables
export const getStatTables = function (combinations, screenWidth) {
  const columns = getColumns(combinations)
  return getTables(combinations, columns, screenWidth)
}
