import { validateLimits } from '../limit/validate.js'
import { loadRunners } from '../run/load.js'
import { selectCombinations } from '../select/main.js'

import { getInputs } from './input.js'
import { getCombinationsProduct } from './product.js'
import { getTasks } from './task.js'
import { validateCombinationsIds } from './validate.js'

// Retrieve each combination, i.e. combination of task + input (if any)
export const getCombinations = async function ({
  tasks,
  cwd,
  systemId,
  include,
  exclude,
  runner,
  limits,
}) {
  // return [
  //   {
  //     taskPath: '/home/ether/code/spyd/benchmark/math_random.task.js',
  //     taskId: 'math_random',
  //     taskTitle: 'MathRandom',
  //     inputId: 'one',
  //     inputTitle: 'One',
  //     inputValue: 1,
  //     commandRunner: 'node',
  //     commandId: 'node',
  //     commandTitle: 'Node',
  //     commandDescription: 'Node (15.3.0)',
  //     commandSpawn: [
  //       'node',
  //       '/home/ether/code/spyd/build/src/run/runners/node/main.js',
  //     ],
  //     commandSpawnOptions: {},
  //     commandConfig: {},
  //     runnerRepeats: true,
  //     systemId: '',
  //     systemTitle: '',
  //   },
  //   {
  //     taskPath: '/home/ether/code/spyd/benchmark/math_random_two.task.js',
  //     taskId: 'math_random_two',
  //     taskTitle: 'MathRandomTwo',
  //     inputId: 'two',
  //     inputTitle: 'Two',
  //     inputValue: 1,
  //     commandRunner: 'node',
  //     commandId: 'node',
  //     commandTitle: 'Node',
  //     commandDescription: 'Node (15.3.0)',
  //     commandSpawn: [
  //       'node',
  //       '/home/ether/code/spyd/build/src/run/runners/node/main.js',
  //     ],
  //     commandSpawnOptions: {},
  //     commandConfig: {},
  //     runnerRepeats: true,
  //     systemId: '',
  //     systemTitle: '',
  //   },
  // ]

  const [tasksA, inputs, runnersA] = await Promise.all([
    getTasks(tasks, cwd),
    getInputs(),
    loadRunners(run),
  ])

  const combinations = getCombinationsProduct({
    tasks: tasksA,
    runners: runnersA,
    inputs,
    system,
  })
  validateCombinationsIds(combinations)

  const combinationsA = selectCombinations(combinations, { include, exclude })

  validateLimits(combinationsA, limits)

  return combinationsA
}
