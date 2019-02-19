import * as logSymbols from 'log-symbols';
import chalk from 'chalk';

export const greenCheck = chalk.green(`${logSymbols.success} `);

export const log = (message, verbose = false) =>
  verbose && console.log(message);

export const logResult = (functionName, result) =>
  log(
    `${greenCheck}  Result of running '${functionName}': ${JSON.stringify(
      result
    )}`,
    true
  );
