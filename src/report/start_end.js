import { PluginError } from '../error/main.js'

// Call all `reporter.start()`
export const startReporters = async function (config) {
  const reporters = await Promise.all(config.reporters.map(startReporter))
  return { ...config, reporters }
}

const startReporter = async function (reporter) {
  const { start, id, bugs } = reporter

  if (start === undefined) {
    return reporter
  }

  try {
    const startData = await start()
    return { ...reporter, startData }
  } catch (cause) {
    throw new PluginError(`Could not start reporter "${id}".`, { cause, bugs })
  }
}

// Call all `reporter.end()`
export const endReporters = async function ({ reporters }) {
  await Promise.all(reporters.map(endReporter))
}

const endReporter = async function ({ end, startData, id, bugs }) {
  if (end === undefined) {
    return
  }

  try {
    await end(startData)
  } catch (cause) {
    throw new PluginError(`Could not end reporter "${id}".`, { cause, bugs })
  }
}
