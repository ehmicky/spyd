import { getReporterPluginError } from './error.js'

// Call all `reporter.start()`
export const startReporters = async (config) => {
  const reporters = await Promise.all(config.reporters.map(startReporter))
  return { ...config, reporters }
}

const startReporter = async (reporter) => {
  const { start, id } = reporter

  if (start === undefined) {
    return reporter
  }

  try {
    const startData = await start()
    return { ...reporter, startData }
  } catch (cause) {
    throw getReporterPluginError(
      reporter,
      `Could not start reporter "${id}".`,
      { cause },
    )
  }
}

// Call all `reporter.end()`
export const endReporters = async ({ reporters }) => {
  await Promise.all(reporters.map(endReporter))
}

const endReporter = async (reporter) => {
  const { end, startData, id } = reporter

  if (end === undefined) {
    return
  }

  try {
    await end(startData)
  } catch (cause) {
    throw getReporterPluginError(reporter, `Could not end reporter "${id}".`, {
      cause,
    })
  }
}
