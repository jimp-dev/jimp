import * as should from 'should/as-function';
import { log, logResult } from '../src/log';

function mockConsoleOnce() {
  const orig = console.log;
  const calls = [];

  function reset() {
    console.log = orig;
  }

  console.log = output => {
    reset();
    calls.push(output);
  };

  return { calls, reset };
}

describe('log', () => {
  it('should print when verbose is set', () => {
    const { calls } = mockConsoleOnce();

    const testString = 'Some string';
    log(testString, true);
    should(calls[0]).be.exactly(testString);
  });

  it("shouldn't print when verbose isn't set", () => {
    const { calls, reset } = mockConsoleOnce();

    const testString = 'Some string';
    log(testString);
    reset();
    should(calls.length).be.exactly(0);
  });
});

describe('logResult', () => {
  it('should print a result', () => {
    const { calls } = mockConsoleOnce();

    logResult('function', 100);
    should(calls[0].indexOf('function') > -1).be.exactly(true);
    should(calls[0].indexOf('100') > -1).be.exactly(true);
  });
});
