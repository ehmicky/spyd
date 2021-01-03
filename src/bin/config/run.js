// Configuration shared by commands that can run combinations: `bench`, `exec`
export const RUN_CONFIG = {
  runner: {
    describe: `Runner-specific configuration properties.
Uses a dot notation such as --runner.node.version=8
Runners measure tasks for a specific programming language or platform.
Built-in runners: node, cli.
Custom runners can be installed from npm.`,
  },
  tasks: {
    describe: `Paths to the task files.
Globbing patterns can be used.
The runner must be specified in the name such as
--tasks.node=./path/to/task_file.js when using the "node" runner.
The task filename (excluding its extension) is used as the task identifier.`,
  },
  input: {},
}
