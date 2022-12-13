// Use `pick()` to filter a configuration property for specific commands.
// All config properties can be specified in `spyd.yml` (unlike CLI flags), for
// any commands.
// Therefore, we need to filter them out depending on the current command.
export const amongCommands = (commands) =>
  boundAmongCommands.bind(undefined, commands)

const boundAmongCommands = (commands, value, { context: { command } }) =>
  commands.includes(command)
