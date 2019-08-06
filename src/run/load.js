import { node } from './node/main.js'

const RUNNERS = { node }

// Import all available runners, as defined by the `run` option.
// Associate each runner option with its runner as well.
export const loadRunners = async function(runOpts) {
  const promises = Object.entries(runOpts).map(loadRunner)
  const allRunners = await Promise.all(promises)
  return allRunners
}

const loadRunner = async function([runnerId, runOpt]) {
  const runner = await importRunner(runnerId)
  return { ...runner, runOpt }
}

const importRunner = function(runnerId) {
  const runner = RUNNERS[runnerId]

  if (runner !== undefined) {
    return runner
  }

  try {
    // TODO: replace with `import()` once it is supported by default by ESLint
    // eslint-disable-next-line global-require, import/no-dynamic-require
    return require(runnerId)
  } catch (error) {
    throw new Error(`Could not load runner '${runnerId}'\n\n${error.stack}`)
  }
}
