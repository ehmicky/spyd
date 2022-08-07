import { SELECT } from './groups.js'

// Configuration shared by commands that can select combinations:
// `run`, `dev`, `show`, `remove`
export const SELECT_CONFIG = {
  select: {
    group: SELECT,
    alias: 's',
    string: true,
    describe: `Select only specific combinations.
The value is a space-separated list of identifiers to select.
Those can be the identifiers of any task, runner, system or variation.

The selection is case-insensitive:
  --select=taskone
can select: taskOne

It can also be partial:
  --select=one
can select: taskOne

Any identifier from the list matches:
  --select="taskOne taskTwo"
selects: taskOne or taskTwo

"and" can be used to separate groups of identifiers:
  --select="taskOne taskTwo and runnerOne"
selects: (taskOne or taskTwo) and runnerOne

"not" can be prepended to exclude combinations instead of selecting them.
  --select='not taskOne taskTwo and runnerOne'
selects: not ((taskOne or taskTwo) nor runnerOne)

Alternatives ("or") of selections can be specified by setting the configuration
property several times.
  --select='not taskOne taskTwo and runnerOne' --select=runnerTwo
selects: (not ((taskOne or taskTwo) nor runnerOne)) or (runnerTwo)

Later selections have priority over earlier ones.
  --select="not taskOne" --select=taskOne
selects taskOne, but:
  --select=taskOne --select="not taskOne"
does not select taskOne

Combinations not targeted by any selection are selected or not depending on
whether the first selection is prepended with "not".
  --select="not taskOne" --select=taskOne
selects taskTwo, but:
  --select=taskOne --select="not taskOne"
does not select taskTwo

By default, all combinations are selected.`,
  },
}
