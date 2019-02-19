import 'should';
import * as fs from 'fs';
import { describe, it } from 'mocha';

import makePath from './utils/makePath';
import setUpCli from '../src/cli';

const testImage1 = makePath(__dirname, './images/qr.jpg');
const testImage2 = makePath(__dirname, './images/qr-convoluted.png');

describe('CLI', function() {
  this.timeout(20 * 1000);
  describe('diff helper', () => {
    it('diff helper', done => {
      setUpCli(['diff', testImage1, testImage2], (output, result) => {
        output.should.be.exactly('diff');
        result.should.be.exactly(0.9747570461662795);
        done();
      }).argv;
    });

    it('outputs a diff image to default path', done => {
      setUpCli(['diff', testImage1, testImage2, '-o'], () => {}).argv;

      setTimeout(() => {
        fs.existsSync('diff.png').should.be.exactly(true);
        fs.unlinkSync('diff.png');
        done();
      }, 1000);
    });

    it('outputs a diff image to default path', done => {
      setUpCli(['diff', testImage1, testImage2, '-o', 'custom.png'], () => {})
        .argv;

      setTimeout(() => {
        fs.existsSync('custom.png').should.be.exactly(true);
        fs.unlinkSync('custom.png');
        done();
      }, 2000);
    });
  });

  describe('distance helper', () => {
    it('calculates distance', done => {
      setUpCli(['distance', testImage1, testImage2], (output, result) => {
        output.should.be.exactly('distance');
        result.should.be.exactly(0.125);
        done();
      }).argv;
    });
  });

  it('loads other functions', done => {
    setUpCli(['rgbaToInt', '1', '2', '3', '4'], (output, result) => {
      output.should.be.exactly('rgbaToInt');
      result.should.be.exactly(16909060);
      done();
    }).argv;
  });

  it('loads fonts for some functions', done => {
    setUpCli(
      ['--font', 'FONT_SANS_32_WHITE', 'measureText', 'some string'],
      (output, result) => {
        output.should.be.exactly('measureText');
        result.should.be.exactly(167);
        done();
      }
    ).argv;
  });
});
