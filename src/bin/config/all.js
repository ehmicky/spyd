// Configuration shared by all commands
export const ALL_CONFIG = {
  config: {
    alias: 'c',
    string: true,
    requiresArg: true,
    describe: `YAML configuration file.
Default: "spyd.yml" in the current directory or any parent directory.
Can specify the same options as the CLI flags.
Environment variables can also be used, prefixed with "SPYD__". For example
SPYD__GROUP=me is like --group=me and SPYD__RUN__NODE__VERSIONS 8 is like
--run.node.versions=8.`,
  },
  cwd: {
    string: true,
    requiresArg: true,
    describe: `Current directory.
Used to find the default configuration and benchmark files.`,
  },
}
