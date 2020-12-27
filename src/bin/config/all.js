// Configuration shared by all commands
export const ALL_CONFIG = {
  settings: {
    alias: 's',
    string: true,
    requiresArg: true,
    describe: `Directory where the task and configuration files are located.
This defaults to a "benchmark" directory in the current or any parent directory.`,
  },
}
