import execa from 'execa'

// Errors are propagated
export const spawnProcess = async function(command, { stdio }) {
  await execa(command, { stdio, shell: true, preferLocal: true })
}
