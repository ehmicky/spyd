// Configuration shared by commands that can select combinations:
// `bench`, `exec`, `show`
export const SELECT_CONFIG = {
  include: {
    alias: 'n',
    string: true,
    array: true,
    requiresArg: true,
  },
  exclude: {
    alias: 'x',
    string: true,
    array: true,
    requiresArg: true,
  },
  tasks: {
    describe: `Paths to the task files.
Globbing patterns can be used.
The runner must be specified in the name such as
--tasks.node=./path/to/task_file.js when using the "node" runner.
The task filename (excluding its extension) is used as the task identifier.`,
  },
  system: {
    string: true,
    requiresArg: true,
    describe: `Name of the current hardware/software system.
Used to compare different machines or configurations together.
Can contain variables such as {{os}}, {{os_full}} or {{VAR}} where VAR is an
environment variable.
Default: ""`,
  },
}
