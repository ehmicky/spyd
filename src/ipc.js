import { execute } from './execute.js'
import { sendParentMessage, getParentMessage } from './ipc_helpers.js'

const setupIpc = async function() {
  await sendParentMessage('ready')

  const duration = await getParentMessage('run')

  const time = execute(duration)
  await sendParentMessage('time', time)
}

setupIpc()
