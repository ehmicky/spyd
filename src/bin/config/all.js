// Configuration shared by all commands
export const ALL_CONFIG = {
  settings: {
    alias: 's',
    string: true,
    requiresArg: true,
    describe: `Directory where the task and configuration files are located.
This defaults to a "benchmark" directory in the current or any parent directory.`,
  },
  config: {
    alias: 'c',
    string: true,
    requiresArg: true,
    describe: `YAML configuration file.
Default: "spyd.yml" in the settings directory.
Can specify the same configuration properties as the CLI flags.
Environment variables can also be used, prefixed with "SPYD__". For example
SPYD__MERGE=id is like --merge=id and SPYD__RUN__NODE__VERSION 8 is like
--run_node_version=8.`,
  },
}
