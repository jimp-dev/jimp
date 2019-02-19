import 'should';
import * as fs from 'fs';

import makePath from './utils/makePath';
import { manipulateImage } from '../src/process-image';

describe('manipulateImage', () => {
  it('write files correctly', async () => {
    const output = 'write.png';
    await manipulateImage({ img: makePath(__dirname, './images/tiny-qr.png') });
    fs.existsSync(output).should.be.exactly(false);

    await manipulateImage({
      img: makePath(__dirname, './images/tiny-qr.png'),
      output: output
    });
    fs.existsSync(output).should.be.exactly(true);
    fs.unlinkSync(output);
  });

  it('runs action with args', async () => {
    const output = 'action-1.png';

    await manipulateImage({
      img: makePath(__dirname, './images/tiny-qr.png'),
      output: output,
      actions: [['resize', 20, 20]]
    });

    fs.readFileSync(output).should.be.deepEqual(
      fs.readFileSync(makePath(__dirname, `./images/${output}`))
    );
    fs.unlinkSync(output);
  });

  it('runs action without args', async () => {
    const output = 'action-2.png';

    await manipulateImage({
      img: makePath(__dirname, './images/tiny-qr.png'),
      output: output,
      actions: ['greyscale']
    });

    fs.readFileSync(output).should.be.deepEqual(
      fs.readFileSync(makePath(__dirname, `./images/${output}`))
    );
    fs.unlinkSync(output);
  });

  it('runs print', async () => {
    const output = 'action-print.png';

    await manipulateImage({
      img: makePath(__dirname, './images/tiny-qr.png'),
      loadFont: 'FONT_SANS_8_WHITE',
      output: output,
      actions: [['print', 0, 0, 'This is a test string!', 50]]
    });

    fs.readFileSync(output).should.be.deepEqual(
      fs.readFileSync(makePath(__dirname, `./images/${output}`))
    );
    fs.unlinkSync(output);
  });

  it('runs print with object', async () => {
    const output = 'action-print.png';

    await manipulateImage({
      img: makePath(__dirname, './images/tiny-qr.png'),
      loadFont: 'FONT_SANS_8_WHITE',
      output: output,
      actions: [['print', 0, 0, '{ "text": "This is a test string!" }', 50]]
    });

    fs.readFileSync(output).should.be.deepEqual(
      fs.readFileSync(makePath(__dirname, `./images/${output}`))
    );
    fs.unlinkSync(output);
  });

  it('transforms boolean args', async () => {
    const output = 'action-boolean.png';

    await manipulateImage({
      img: makePath(__dirname, './images/tiny-qr.png'),
      output: output,
      actions: [['flip', true, false]]
    });

    fs.readFileSync(output).should.be.deepEqual(
      fs.readFileSync(makePath(__dirname, `./images/${output}`))
    );
    fs.unlinkSync(output);
  });
});
