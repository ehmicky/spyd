import {
  BaseError,
  PluginError,
  UserError,
  TaskError,
} from '../../error/main.js'
import {
  BaseError as RunnerBaseError,
  TasksLoadError,
  TasksRunError,
  TasksSyntaxError,
  ConfigError,
} from '../../runners/common/error.js'

// When a task throws during any stage, we propagate the error and fail the
// benchmark. Tasks that throw are unstable and might yield invalid benchmarks,
// so we fail hard.
// The task sends an `error` object in a format that is based on JavaScript but
// should work for any programming language: `name`, `message`, `stack`.
export const throwOnTaskError = function ({ error: errorObject }) {
  if (errorObject === undefined) {
    return
  }

  const error = RunnerBaseError.parse(errorObject)
  throw BaseError.switch(error)
    .case(TasksLoadError, TaskError, 'Could not load the tasks file.')
    .case(TasksRunError, TaskError, 'Could not run the task.')
    .case(TasksSyntaxError, UserError, 'Syntax error in the tasks file.')
    .case(ConfigError, UserError, 'Runner configuration error.')
    .default(PluginError, 'Runner internal bug.')
}
