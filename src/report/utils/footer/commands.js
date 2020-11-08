// Add `benchmark.commandsPretty`, CLI-friendly serialization of
// `benchmark.commands`
export const getCommands = function (commands) {
  if (commands === undefined) {
    return
  }

  return { Runners: commands.map(getDescription) }
}

const getDescription = function ({ description }) {
  return description
}
