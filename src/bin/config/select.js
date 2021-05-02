import { SELECT } from './groups.js'

// Configuration shared by commands that can select combinations:
// `bench`, `exec`, `show`, `remove`
export const SELECT_CONFIG = {
  select: {
    group: SELECT,
    alias: 's',
    string: true,
    array: true,
    describe: `Select only specific combinations.
The value is a space-separated list of identifiers to select.
Those can be the identifiers of any task, runner, system or variation.

When specifying the same category, "or" is used:
  --select="taskOne taskTwo"
selects any combinations from:
  taskOne or taskTwo

When specifying different categories, "and" is used instead:
  --select="taskOne runnerOne"
selects any combinations from:
  taskOne and runnerOne

Both can be combined:
  --select="taskOne taskTwo runnerOne"
selects any combinations from:
  (taskOne or taskTwo) and runnerOne

Tildes can be used to exclude specific identifiers ("not"):
  --select='~taskOne ~taskTwo'
selects any combinations from:
  not (taskOne or taskTwo)
Note: you need to might to use single quotes with your shell.

Alternatives ("or") can be set by specifying the configuration property several
times. Unless alternatives described above, those can be entire selections,
including between different categories:
  --select=taskOne --select=runnerOne
selects any combinations from:
  either taskOne or runnerOne

By default, all combinations are selected.`,
  },
}
