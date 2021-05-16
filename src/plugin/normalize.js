// Normalize plugins configuration
export const normalizePluginsConfig = function (config, command) {
  const configA = normalizeReporters(config, command)
  return configA
}

// Reporting in the `remove` command is shown so the user can be clear about
// which result was removed, and provide with confirmation.
// So we only need to print in the terminal, not output|insert files.
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
