// Fit several `columns` of same width (`columnsWidth`) responsively in a
// terminal of `availableWidth` by putting them into several groups meant to be
// printed on different lines.
export const getResponsiveColumns = function ({
  availableWidth,
  columnsWidth,
  separatorWidth,
  columns,
}) {
  const { allColumns } = columns.reduce(
    addColumn.bind(undefined, { availableWidth, columnsWidth, separatorWidth }),
    { allColumns: [], remainingWidth: 0 },
  )
  // eslint-disable-next-line fp/no-mutating-methods
  return allColumns.reverse()
}

const addColumn = function (
  { availableWidth, columnsWidth, separatorWidth },
  { allColumns, allColumns: [columns, ...previousColumns], remainingWidth },
  column,
) {
  const remainingWidthA = remainingWidth - columnsWidth - separatorWidth
  return remainingWidthA >= 0
    ? {
        allColumns: [[...columns, column], ...previousColumns],
        remainingWidth: remainingWidthA,
      }
    : {
        allColumns: [[column], ...allColumns],
        remainingWidth: availableWidth - columnsWidth,
      }
}
