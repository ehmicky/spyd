import { applyTemplate } from '../template.js'

// `shell` can contain variables, i.e. can be a string 'true' or 'false'
export const getShell = function(
  { shell = DEFAULT_SHELL, ...entries },
  variables,
) {
  if (typeof shell === 'boolean') {
    return { shell, entries }
  }

  const shellA = applyTemplate(shell, variables)
  const shellB = shellA === 'true'
  return { shell: shellB, entries }
}

const DEFAULT_SHELL = true
