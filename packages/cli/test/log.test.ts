import * as should from 'should/as-function';
import { log, logResult } from '../src/log';
import { mockConsole } from './utils/mock-console';

describe('log', () => {
  it('should print when verbose is set', () => {
    const { calls } = mockConsole();
    const testString = 'Some string';

    log(testString, true);
    should(calls[0]).be.deepEqual([testString]);
  });

  it("shouldn't print when verbose isn't set", () => {
    const { calls, reset } = mockConsole();
    const testString = 'Some string';

    log(testString);
    reset();
    should(calls.length).be.exactly(0);
  });
});

describe('logResult', () => {
  it('should print a result', () => {
    const { calls } = mockConsole();

    logResult('function', 100);
    should(calls[0][0].indexOf('function') > -1).be.exactly(true);
    should(calls[0][0].indexOf('100') > -1).be.exactly(true);
  });
});
