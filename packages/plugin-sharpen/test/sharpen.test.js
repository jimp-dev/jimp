import { Jimp, mkJGD, hashForEach } from '@jimp/test-utils';
import configure from '@jimp/custom';

import sharpen from '../src';

const jimp = configure({ plugins: [resize] }, Jimp);

describe('Sharpen images', () => {});
