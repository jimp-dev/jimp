// TypeScript Version: 2.8

import configure from '@jimp/custom';
import gif from '@jimp/gif';
import png from '@jimp/png';
import displace from '@jimp/plugin-displace';
import resize from '@jimp/plugin-resize';

// configure should return a valid Jimp type with addons
const CustomJimp = configure({
  types: [gif, png],
  plugins: [displace, resize]
});

// Methods from types should be applied
CustomJimp.filterType(4);
// Constants from types should be applied
CustomJimp.PNG_FILTER_NONE;

// Core functions should still work from Jimp
CustomJimp.read('Test');

// Constants should be applied from ill-formed plugins
CustomJimp.displace(CustomJimp, 2);

// Methods should be applied from well-formed plugins
CustomJimp.resize(40, 40)

// Constants should be applied from well-formed plugins
CustomJimp.RESIZE_NEAREST_NEIGHBOR
