// Normalize plugins configuration
export const normalizePluginsConfig = function (config, command) {
  const configA = normalizeReporters(config, command)
  return configA
}

// The `remove` command reports before the removal. This is only intended for
// interactive purpose, i.e. only reporters printing to the terminal are used.
const normalizeReporters = function (config, command) {
  if (command !== 'remove') {
    return config
  }

  const reporters = config.reporters.filter(hasTtyOutput)
  return { ...config, reporters }
}

const hasTtyOutput = function ({ config: { output } }) {
  return output === undefined
}
