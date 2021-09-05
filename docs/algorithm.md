This describes:

- some problems encountered when trying to measure code in an accurate, precise
  and repeatable way
- the solutions implemented by this library

## Number of iterations

_Problem_: Many other benchmarking libraries execute tasks using a fixed number
of iterations. This approach
[has several issues](https://mathiasbynens.be/notes/javascript-benchmarking).

Faster code has lower precision which means:

- the faster the code or the runtime gets, the less precise the results become
- when comparing tasks, the faster ones are less precise

Also, users cannot specify how long they are ready to wait:

- user experience is bad when tasks are unexpectedly slow
- measures are imprecise when tasks are unexpectedly fast
- a separate timeout configuration property is required

_Solution_: Users specify a maximum duration instead of a fixed number of
iterations.

## Processes precision

_Problem_: Different processes (e.g. measuring the same tasks over time) have
different performance profiles resulting in differences between benchmarks. This
is because different processes execute with slightly faster or slower
performance than others due to OS and runtime internals.

_Solution_: Benchmarks are spread over several processes and their results are
merged. They are executed serially in order not to compete with each other,
which would otherwise make measures slower and less precise.

Processes are used instead of threads because:

- time slicing might happen in the middle of a measure
- in some languages (like Node.js), threads execute in a slightly different
  environment which might be unexpected inside the task

## Runtime optimization

_Problem_: Due to runtime optimization, the more a task is executed, the faster
is gets. Which means longer benchmarks result in faster results.

_Solution_: The benchmark is split into consecutive processes with the same
duration. As a task gets faster or as a benchmark gets longer, more processes
are spawned but their duration remains the same.

## Slow downs

_Problem_: Performance greatly decreases at regular intervals due to the runtime
background processes (such as garbage collection).

Also, due to runtime optimization and memoization, the first invocation of most
tasks is much slower than the later ones.

_Solution_: Measures that are extremely slow compared to the others are
discarded.

## Measuring cost

_Problem_: Measuring typically requires retrieving timestamps. Doing so
increases a task's apparent duration but is unrelated to the task itself. This
is a concern especially when the task's duration is close to the duration spent
retrieving timestamps.

_Solution_: The task is looped in order to decrease the percentage of the
measure related to retrieving timestamps.

## Time resolution

_Problem_: The task duration might be too close to the system's time resolution
to be precisely estimated.

_Solution_: The task's loop size is computed based on the system's time
resolution.

## Asynchronous tasks

_Problem_: Asynchronous functions require asynchrounous measuring logic. However
asynchrounous measuring logic is slower, which results in different measures.

_Solution_: Different logic is used to measure synchronous and asynchronous
tasks.

## Simple tasks optimization

_Problem_: Tasks that are very simple like `1 + 1` might be removed by the
runtime's optimization.

_Solution_: Solving this depends on the runtime. In general, one needs to add
some statements to prevent this type of runtime optimization. Returning values
and assigning variables sometimes do the trick.

## Very fast tasks

_Problem_: The duration of tasks that last for only a few CPU cycles (close to
`1ns` on a typical machine) is hard to differentiate from the time to create its
function's call stack.

_Solution_: Using a "for" loop is already done by spyd, so does not help there.
Instead, using a bigger or more complex input/argument should help.

Loop unrolling (calling the function several times in a row without a "for"
loop) is usually not a great solution to this due to peculiar ways those are
optimized by runtimes and to functions size limits.
