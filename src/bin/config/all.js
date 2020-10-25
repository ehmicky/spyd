// Configuration shared by all commands
export const ALL_CONFIG = {
  config: {
    alias: 'c',
    string: true,
    requiresArg: true,
    describe: `YAML configuration file.
Can specify the same options as the CLI flags.
Environment variables can also be used, prefixed with "SPYD_". For example
SPYD_GROUP=same is like --group same and SPYD_RUN_NODE_VERSIONS 8 is like
--run.node.versions 8.
Default: "spyd.yml" in the current directory or any parent directory`,
  },
  cwd: {
    string: true,
    requiresArg: true,
    describe: `Current directory.
Used to find the default configuration and benchmark files.`,
  },
}
