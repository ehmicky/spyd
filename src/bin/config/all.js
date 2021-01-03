// Configuration shared by all commands
export const ALL_CONFIG = {
  config: {
    alias: 'c',
    string: true,
    requiresArg: true,
    describe: `Path to the configuration file.
Default: "benchmark/spyd.yml" in the current or any parent directory.`,
  },
  extend: {
    string: true,
    requiresArg: true,
  },
  debug: {
    boolean: true,
  },
}
