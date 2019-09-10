// TypeScript Version: 2.8

import configure from '@jimp/custom';
import gif from '@jimp/gif';
import png from '@jimp/png';
import displace from '@jimp/plugin-displace';
import resize from '@jimp/plugin-resize';
import scale from '@jimp/plugin-scale';

// configure should return a valid Jimp type with addons
const CustomJimp = configure({
  types: [gif, png],
  plugins: [displace, resize]
});

// Methods from types should be applied
CustomJimp.filterType(4);
// Constants from types should be applied
// $ExpectType 0
CustomJimp.PNG_FILTER_NONE;

// Core functions should still work from Jimp
CustomJimp.read('Test');

// Constants should be applied from ill-formed plugins
CustomJimp.displace(CustomJimp, 2);

// Methods should be applied from well-formed plugins
CustomJimp.resize(40, 40)

// Constants should be applied from well-formed plugins
CustomJimp.RESIZE_NEAREST_NEIGHBOR

// Can compose
const OtherCustomJimp = configure({
  plugins: [scale]
}, CustomJimp);

// Methods from new plugins should be applied
OtherCustomJimp.scale(3);

// Methods from types should be applied
OtherCustomJimp.filterType(4);
// Constants from types should be applied
/**
 * This is commented out as TS assigns the value of `any` due to the complexity of typing
 * 
 * This may be fixed/improved in a future version of TS, but as-of 3.6 even this relatively
 * trivial composing of `configure` will be typed as `any`
 * 
 * Tests left for future-proofing all-the-same
 */
// $ExpectType 0
OtherCustomJimp.PNG_FILTER_NONE;

// Core functions should still work from Jimp
OtherCustomJimp.read('Test');

// Constants should be applied from ill-formed plugins
OtherCustomJimp.displace(OtherCustomJimp, 2);

// Methods should be applied from well-formed plugins
OtherCustomJimp.resize(40, 40)

// Constants should be applied from well-formed plugins
OtherCustomJimp.RESIZE_NEAREST_NEIGHBOR
