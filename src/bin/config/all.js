// Configuration shared by all commands
export const ALL_CONFIG = {
  config: {
    alias: 'c',
    string: true,
    requiresArg: true,
    describe: `Path to the configuration file.
Default: "benchmark/spyd.{yml,js,cjs,ts}" in the current or any parent
directory.`,
  },
  extend: {
    string: true,
    requiresArg: true,
    describe: `Path to a configuration file to extend from.
As opposed to "config", this is used to share configuration between projects.`,
  },
  debug: {
    boolean: true,
  },
}
