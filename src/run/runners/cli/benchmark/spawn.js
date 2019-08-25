import execa from 'execa'

// Errors are propagated
export const spawnProcess = async function(
  command,
  { variation, shell, stdio },
) {
  const shellA = String(shell) === 'true'
  const execaFunc = shellA ? execa : execa.command
  await execaFunc(command, { stdio, shell: shellA, preferLocal: true })
}
