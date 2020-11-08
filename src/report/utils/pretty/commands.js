// Add `benchmark.commandsPretty`, CLI-friendly serialization of
// `benchmark.commands`
export const prettifyCommands = function (commands) {
  if (commands === undefined) {
    return
  }

  const body = commands.map(getDescription).join('\n')
  return body
}

const getDescription = function ({ description }) {
  return description
}
