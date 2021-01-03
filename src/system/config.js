// We only keep configuration properties that are relevant for reporting
export const getSystemConfig = function ({ duration, run: runConfig }) {
  const durationA = duration / NANOSECS_TO_SECS
  const runConfigA = getRunConfig(runConfig)
  return { duration: durationA, ...runConfigA }
}

const NANOSECS_TO_SECS = 1e9

const getRunConfig = function (runConfig) {
  const runConfigA = Object.fromEntries(
    runConfig.filter(hasRunConfig).map(getRunConfigProp),
  )

  if (Object.keys(runConfigA).length === 0) {
    return {}
  }

  return { run: runConfigA }
}

const hasRunConfig = function ({ config }) {
  return Object.keys(config).length !== 0
}

const getRunConfigProp = function ({ id, config }) {
  return [id, config]
}
