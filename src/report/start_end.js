import { PluginError } from '../error/main.js'
import { wrapError } from '../error/wrap.js'

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
  } catch (error) {
    throw wrapError(
      error,
      `When starting reporter "${reporter.id}":`,
      PluginError,
    )
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
  } catch (error) {
    throw wrapError(error, `When ending reporter "${id}":`, PluginError)
  }
}
