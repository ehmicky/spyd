import { PluginError } from '../error/main.js'

// Call all `reporter.start()`
export const startReporters = async function (config) {
  const reporters = await Promise.all(config.reporters.map(startReporter))
  return { ...config, reporters }
}

const startReporter = async function (reporter) {
  if (reporter.start === undefined) {
    return reporter
  }

  try {
    const startData = await reporter.start()
    return { ...reporter, startData }
  } catch (cause) {
    throw new PluginError(`Could not start reporter "${reporter.id}".`, {
      cause,
    })
  }
}

// Call all `reporter.end()`
export const endReporters = async function ({ reporters }) {
  await Promise.all(reporters.map(endReporter))
}

const endReporter = async function ({ end, startData, id }) {
  if (end === undefined) {
    return
  }

  try {
    await end(startData)
  } catch (cause) {
    throw new PluginError(`Could not end reporter "${id}".`, { cause })
  }
}
