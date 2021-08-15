import { SELECT } from './groups.js'

// Configuration shared by commands that can select combinations:
// `run`, `dev`, `show`, `remove`
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
selects taskOne or taskTwo

When specifying different categories, "and" is used instead:
  --select="taskOne runnerOne"
selects taskOne and runnerOne

Both can be combined:
  --select="taskOne taskTwo runnerOne"
selects (taskOne or taskTwo) and runnerOne

"not" can be prepended to exclude combinations instead of selecting them.
  --select='not taskOne taskTwo'
selects not (taskOne or taskTwo)

Alternatives ("or") of selections can be specified by setting the configuration
property several times.
  --select=taskOne --select=runnerOne
selects taskOne or runnerOne

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
