import { SELECT } from './groups.js'

// Configuration shared by commands that can select combinations:
// `bench`, `exec`, `show`, `remove`
export const SELECT_CONFIG = {
  include: {
    group: SELECT,
    alias: 'n',
    string: true,
    array: true,
    describe: `Select only specific combinations.
The value is a space-separated list of identifiers to select.
Those can be the identifiers of any task, runner, system or variation.

When specifying the same category, "or" is used:
  --include="taskOne taskTwo"
selects any combinations from:
  taskOne or taskTwo

When specifying different categories, "and" is used instead:
  --include="taskOne runnerOne"
selects any combinations from:
  taskOne and runnerOne

Both can be combined:
  --include="taskOne taskTwo runnerOne"
selects any combinations from:
  (taskOne or taskTwo) and runnerOne

Tildes can be used to exclude specific identifiers ("not"):
  --include='~taskOne ~taskTwo'
selects any combinations from:
  not (taskOne or taskTwo)
Note: you need to might to use single quotes with your shell.

Alternatives ("or") can be set by specifying the configuration property several
times. Unless alternatives described above, those can be entire selections,
including between different categories:
  --include=taskOne --include=runnerOne
selects any combinations from:
  either taskOne or runnerOne

By default, all combinations are included.`,
  },
  exclude: {
    group: SELECT,
    alias: 'x',
    string: true,
    array: true,
    describe: `Exclude specific combinations.
The syntax is the same as the "include" configuration property.
"exclude" has priority over "include".
By default, no combinations are excluded.`,
  },
}
