// Configuration shared by commands that can run combinations: `bench`, `exec`
export const RUN_CONFIG = {
  run: {
    describe: `Runner-specific configuration properties.
Runners measure tasks for a specific programming language or platform.
Built-in runners: node, cli.
Custom runners can be installed from npm.
Uses a dot notation such as --run.node.version=8`,
  },
  input: {},
}
