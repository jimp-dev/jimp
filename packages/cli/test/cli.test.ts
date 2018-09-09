import * as fs from 'fs';
import * as path from 'path';
import { describe, it } from 'mocha';

import * as should from 'should/as-function';

import setUpCli from '../src/cli';

const testImage1 = path.resolve(path.join(__dirname, './images/qr.jpg'));
const testImage2 = path.resolve(
  path.join(__dirname, './images/qr-convoluted.png')
);

describe('CLI', function() {
  this.timeout(20 * 1000);
  describe('diff helper', () => {
    it('diff helper', done => {
      setUpCli(['diff', testImage1, testImage2], (output, result) => {
        should(output).be.exactly('diff');
        should(result).be.exactly(0.9747570461662795);
        done();
      }).argv;
    });

    it('outputs a diff image to default path', done => {
      setUpCli(['diff', testImage1, testImage2, '-o'], () => {}).argv;

      setTimeout(() => {
        should(fs.existsSync('diff.png')).be.exactly(true);
        fs.unlinkSync('diff.png');
        done();
      }, 1000);
    });

    it('outputs a diff image to default path', done => {
      setUpCli(['diff', testImage1, testImage2, '-o', 'custom.png'], () => {})
        .argv;

      setTimeout(() => {
        should(fs.existsSync('custom.png')).be.exactly(true);
        fs.unlinkSync('custom.png');
        done();
      }, 2000);
    });
  });

  describe('distance helper', () => {
    it('calculates distance', done => {
      setUpCli(['distance', testImage1, testImage2], (output, result) => {
        should(output).be.exactly('distance');
        should(result).be.exactly(0.125);
        done();
      }).argv;
    });
  });

  it('loads other functions', done => {
    setUpCli(['rgbaToInt', '1', '2', '3', '4'], (output, result) => {
      should(output).be.exactly('rgbaToInt');
      should(result).be.exactly(16909060);
      done();
    }).argv;
  });

  it('loads fonts for some functions', done => {
    setUpCli(
      ['--font', 'FONT_SANS_32_WHITE', 'measureText', 'some string'],
      (output, result) => {
        should(output).be.exactly('measureText');
        should(result).be.exactly(182);
        done();
      }
    ).argv;
  });
});
