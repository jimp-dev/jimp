export function mockConsole(times = 1) {
  const orig = console.log;
  const calls = [];

  function reset() {
    console.log = orig;
  }

  let callMockedLeft = times;

  console.log = (...output) => {
    calls.push(output);

    if (callMockedLeft === 0) {
      reset();
    }

    callMockedLeft -= 1;
  };

  return { calls, reset };
}
