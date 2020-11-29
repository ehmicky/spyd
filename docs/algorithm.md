This describes:

- some problems encountered when trying to measure code in an accurate, precise
  and repeatable way
- the solutions implemented by this library

## Number of iterations

_Problem_: Many other benchmarking libraries execute tasks using a fixed number
of iterations. This approach
[has several issues](https://mathiasbynens.be/notes/javascript-benchmarking).

Faster code has higher variance which means:

- the faster the code or the runtime gets, the less precise the results become
- when comparing tasks, the faster ones are less precise

Also, users cannot specify how long they are ready to wait:

- user experience is bad when tasks are unexpectedly slow
- measures are imprecise when tasks are unexpectedly fast
- a separate timeout configuration property is required

_Solution_: Users specify a maximum duration instead of a fixed number of
iterations.

## Processes variance

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

Also, medians are used instead of arithmetic means.

## Measuring cost

_Problem_: Measuring adds a small performance cost:

- retrieving timestamps
- making the function call itself (even if the task is empty)
- repeatedly checking whether the measuring loop should end
- loading the measuring logic and/or processes

That cost increases a task's apparent time but is unrelated to the task itself.

_Solution_: Those costs are estimated by measuring an empty function then
subtracting it from the measures.

The task is also looped in order to decrease the percentage of the measure
related to the measuring cost.

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

## Very fast tasks

_Problem_: Tasks that are as fast as the measuring logic itself (e.g. faster
than `1ns`) cannot be measured precisely because their measure cannot be
separated from the duration of the measuring logic itself.

_Solution_: No benchmarking library (including this one) seems to provide a
solution at the moment. Such code will be measured as taking `0ns`.

_Invalid solution_: Using loop unrolling such as
`new Function('f', 'f();'.repeat(number))` or
`new Function('', func.toString().repeat(number))` has several issues:

- this actually has more variance sometimes and is slower than a regular loop
- this requires lots of memory. Because of this the number of iterations cannot
  be high enough to provide with precise results.
- this is weirdly optimized by runtimes

_Invalid solution_: Using CPU profiling has several issues:

- the measures vary too much due to sampling
- the minimum resolution is often too high to precisely measure very fast
  functions
- the measures are in number of hits instead of number of nanoseconds
- this is runtime-specific
