// Call all `reporter.end()`
export const endReporters = async function (reporters) {
  await Promise.all(reporters.map(endReporter))
}

const endReporter = async function ({ end }) {
  if (end === undefined) {
    return
  }

  await end()
}
