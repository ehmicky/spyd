// Call all `reporter.start()`
export const startReporters = async function ({ reporters, ...config }) {
  const reportersA = await Promise.all(reporters.map(startReporter))
  return { ...config, reporters: reportersA }
}

const startReporter = async function ({ start, ...reporter }) {
  if (start === undefined) {
    return reporter
  }

  const startData = await start()
  return { ...reporter, startData }
}

// Call all `reporter.end()`
export const endReporters = async function ({ reporters }) {
  await Promise.all(reporters.map(endReporter))
}

const endReporter = async function ({ end, startData }) {
  if (end === undefined) {
    return
  }

  await end(startData)
}
