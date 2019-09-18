import configure from '@jimp/custom';
import gif from '@jimp/gif';
import png from '@jimp/png';
import displace from '@jimp/plugin-displace';
import resize from '@jimp/plugin-resize';
import scale from '@jimp/plugin-scale';
import types from '@jimp/types';
import plugins from '@jimp/plugins';

// configure should return a valid Jimp type with addons
const CustomJimp = configure({
  types: [gif, png],
  plugins: [displace, resize]
});

test('can handle custom jimp', () => {
  // Methods from types should be applied
  CustomJimp.deflateLevel(4);
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
  
  // $ExpectError
  CustomJimp.test;
  
  // $ExpectError
  CustomJimp.func();

  const Jiimp = new CustomJimp('test');
  // Methods from types should be applied
  Jiimp.deflateLevel(4);
  // Constants from types should be applied
  // $ExpectType 0
  Jiimp.PNG_FILTER_NONE;

  // Core functions should still work from Jimp
  Jiimp.read('Test');

  // Constants should be applied from ill-formed plugins
  Jiimp.displace(Jiimp, 2);

  // Methods should be applied from well-formed plugins
  Jiimp.resize(40, 40)

  // Constants should be applied from well-formed plugins
  Jiimp.RESIZE_NEAREST_NEIGHBOR

  // $ExpectError
  Jiimp.test;

  // $ExpectError
  Jiimp.func();
});

test('can compose', () => {
  const OtherCustomJimp = configure({
      plugins: [scale]
    }, CustomJimp);

  // Methods from new plugins should be applied
  OtherCustomJimp.scale(3);

  // Methods from types should be applied
  OtherCustomJimp.filterType(4);
  // Constants from types should be applied
  // $ExpectType 0
  OtherCustomJimp.PNG_FILTER_NONE;

  // Core functions should still work from Jimp
  OtherCustomJimp.read('Test');

  // Constants should be applied from ill-formed plugins
  OtherCustomJimp.displace(OtherCustomJimp, 2);

  // Methods should be applied from well-formed plugins
  OtherCustomJimp.resize(40, 40);

  // Constants should be applied from well-formed plugins
  OtherCustomJimp.RESIZE_NEAREST_NEIGHBOR;

  // $ExpectError
  OtherCustomJimp.test;

  // $ExpectError
  OtherCustomJimp.func();
  
  const Jiimp = new OtherCustomJimp('test');
  // Methods from types should be applied
  Jiimp.deflateLevel(4);
  // Constants from types should be applied
  // $ExpectType 0
  Jiimp.PNG_FILTER_NONE;

  // Core functions should still work from Jimp
  Jiimp.read('Test');

  // Constants should be applied from ill-formed plugins
  Jiimp.displace(Jiimp, 2);

  // Methods should be applied from well-formed plugins
  Jiimp.resize(40, 40)

  // Constants should be applied from well-formed plugins
  Jiimp.RESIZE_NEAREST_NEIGHBOR

  // $ExpectError
  Jiimp.test;

  // $ExpectError
  Jiimp.func();
});

test('can handle only plugins', () => {
  const PluginsJimp = configure({
    plugins: [plugins]
  });

  // Core functions should still work from Jimp
  PluginsJimp.read('Test');

  // Constants should be applied from ill-formed plugins
  PluginsJimp.displace(PluginsJimp, 2);

  // Methods should be applied from well-formed plugins
  PluginsJimp.resize(40, 40);

  // Constants should be applied from well-formed plugins
  // $ExpectType "nearestNeighbor"
  PluginsJimp.RESIZE_NEAREST_NEIGHBOR;

  // $ExpectError
  PluginsJimp.test;

  // $ExpectError
  PluginsJimp.func();

  const Jiimp = new PluginsJimp('test');
  
  // Core functions should still work from Jimp
  Jiimp.read('Test');

  // Constants should be applied from ill-formed plugins
  Jiimp.displace(Jiimp, 2);

  // Methods should be applied from well-formed plugins
  Jiimp.resize(40, 40)

  // Constants should be applied from well-formed plugins
  Jiimp.RESIZE_NEAREST_NEIGHBOR

  // $ExpectError
  Jiimp.test;

  // $ExpectError
  Jiimp.func();
})

test('can handle only all types', () => {
  const TypesJimp = configure({
    types: [types]
  });

  // Methods from types should be applied
  TypesJimp.filterType(4);
  // Constants from types should be applied
  // $ExpectType 0
  TypesJimp.PNG_FILTER_NONE;

  // $ExpectError
  TypesJimp.test;

  // $ExpectError
  TypesJimp.func();

  const Jiimp = new TypesJimp('test');
  // Methods from types should be applied
  Jiimp.filterType(4);
  // Constants from types should be applied
  // $ExpectType 0
  Jiimp.PNG_FILTER_NONE;

  // $ExpectError
  Jiimp.test;

  // $ExpectError
  Jiimp.func();
});

test('can handle only one type', () => {
  const PngJimp = configure({
    types: [png]
  });

  // Constants from other types should be not applied
  // $ExpectError
  PngJimp.MIME_TIFF;

  // Constants from types should be applied
  // $ExpectType 0
  PngJimp.PNG_FILTER_NONE;
  
  // $ExpectError
  PngJimp.test;

  // $ExpectError
  PngJimp.func();


  const Jiimp = new PngJimp('test');
  // Constants from other types should be not applied
  // $ExpectError
  Jiimp.MIME_TIFF;

  // Constants from types should be applied
  // $ExpectType 0
  Jiimp.PNG_FILTER_NONE;

  // $ExpectError
  Jiimp.test;

  // $ExpectError
  Jiimp.func();
});


test('can handle only one plugin', () => {
  const ResizeJimp = configure({
    plugins: [resize]
  });

  // Constants from other plugins should be not applied
  // $ExpectError
  ResizeJimp.FONT_SANS_8_BLACK;

  // Constants from plugin should be applied
  // $ExpectType "nearestNeighbor"
  ResizeJimp.RESIZE_NEAREST_NEIGHBOR;

  ResizeJimp.resize(2, 2);

  // $ExpectError
  ResizeJimp.test;

  // $ExpectError
  ResizeJimp.func();


  const Jiimp: typeof ResizeJimp = new ResizeJimp('test');
  // Constants from other plugins should be not applied
  // $ExpectError
  Jiimp.FONT_SANS_8_BLACK;

  // Constants from plugin should be applied
  // $ExpectType "nearestNeighbor"
  Jiimp.RESIZE_NEAREST_NEIGHBOR;

  Jiimp.resize(2, 2);

  // $ExpectError
  Jiimp.test;

  // $ExpectError
  Jiimp.func();
});
