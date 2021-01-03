// Configuration shared by commands that can run combinations: `bench`, `exec`
export const RUN_CONFIG = {
  runner: {
    describe: `Runner-specific configuration properties.
Uses a dot notation such as --runner.node.version=8
Runners measure tasks for a specific programming language or platform.
Built-in runners: node, cli.
Custom runners can be installed from npm.`,
  },
  input: {},
}
