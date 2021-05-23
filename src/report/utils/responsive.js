// Group all column names into several tables so they fit the screen width
export const getResponsiveColumns = function ({
  availableWidth,
  columnWidth,
  separatorWidth,
  columns,
}) {
  const { allColumns } = columns.reduce(
    addColumn.bind(undefined, { availableWidth, columnWidth, separatorWidth }),
    { allColumns: [], remainingWidth: 0 },
  )
  // eslint-disable-next-line fp/no-mutating-methods
  return allColumns.reverse()
}

const addColumn = function (
  { availableWidth, columnWidth, separatorWidth },
  { allColumns, allColumns: [columns, ...previousColumns], remainingWidth },
  column,
) {
  const remainingWidthA = remainingWidth - columnWidth - separatorWidth
  return remainingWidthA >= 0
    ? {
        allColumns: [[...columns, column], ...previousColumns],
        remainingWidth: remainingWidthA,
      }
    : {
        allColumns: [[column], ...allColumns],
        remainingWidth: availableWidth - columnWidth,
      }
}
