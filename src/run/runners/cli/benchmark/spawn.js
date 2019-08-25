import execa from 'execa'

// Errors are propagated
export const spawnProcess = async function(
  command,
  { variation, shell, stdio },
) {
  const execaFunc = shell ? execa : execa.command
  await execaFunc(command, { stdio, shell, preferLocal: true })
}
