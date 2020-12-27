import { validateLimits } from '../limit/validate.js'
import { addTitles } from '../report/utils/title/main.js'
import { loadRunners } from '../run/load.js'
import { selectCombinations } from '../select/main.js'

import { removeDuplicates } from './duplicate.js'
import { loadCombinations } from './load.js'
import { getTaskPaths } from './path.js'

// Retrieve each combination, i.e. combination of task + input (if any)
// eslint-disable-next-line max-lines-per-function
export const getCombinations = async function ({
  files,
  duration,
  cwd,
  system,
  tasks,
  inputs,
  run: runners,
  limits,
}) {
  return [
    {
      taskPath: '/home/ether/code/spyd/benchmark/math_random.task.js',
      taskId: 'math_random',
      taskTitle: 'MathRandom',
      inputId: 'one',
      inputTitle: 'One',
      inputValue: 1,
      commandRunner: 'node',
      commandId: 'node',
      commandTitle: 'Node',
      commandDescription: 'Node (15.3.0)',
      commandSpawn: [
        'node',
        '/home/ether/code/spyd/build/src/run/runners/node/main.js',
      ],
      commandSpawnOptions: {},
      commandConfig: {},
      runnerRepeats: true,
      systemId: '',
      systemTitle: '',
    },
    {
      taskPath: '/home/ether/code/spyd/benchmark/math_random_two.task.js',
      taskId: 'math_random_two',
      taskTitle: 'MathRandomTwo',
      inputId: 'two',
      inputTitle: 'Two',
      inputValue: 1,
      commandRunner: 'node',
      commandId: 'node',
      commandTitle: 'Node',
      commandDescription: 'Node (15.3.0)',
      commandSpawn: [
        'node',
        '/home/ether/code/spyd/build/src/run/runners/node/main.js',
      ],
      commandSpawnOptions: {},
      commandConfig: {},
      runnerRepeats: true,
      systemId: '',
      systemTitle: '',
    },
  ]

  // TODO: fix
  // eslint-disable-next-line no-unreachable
  const taskPaths = await getTaskPaths(files, cwd)

  const runnersA = await loadRunners(runners, taskPaths)

  const combinations = await getAllCombinations({
    taskPaths,
    runners: runnersA,
    duration,
    cwd,
    system,
    tasks,
    inputs,
    limits,
  })

  const combinationsA = addTitles(combinations)
  return combinationsA
}

const getAllCombinations = async function ({
  taskPaths,
  runners,
  duration,
  cwd,
  system,
  tasks,
  inputs,
  limits,
}) {
  const combinations = await loadCombinations({
    taskPaths,
    runners,
    duration,
    cwd,
    system,
  })

  const combinationsA = removeDuplicates(combinations)
  const combinationsB = selectCombinations(combinationsA, { tasks, inputs })

  validateLimits(combinationsB, limits)

  return combinationsB
}
