import { throwError, isNodePattern } from '@jimp/utils';
import { encodeIco } from './ico';

const MIME_TYPE = 'image/x-icon';

const isValidSize = size => size > 0 && size <= 256;

const isValidLayer = layer =>
  (typeof layer === 'number' && isValidSize(layer)) ||
  (Object.prototype.hasOwnProperty.call(layer, 'width') &&
    isValidSize(layer.width) &&
    Object.prototype.hasOwnProperty.call(layer, 'height') &&
    isValidSize(layer.height));

function encode(image) {
  const layers = image._icoLayers.map(layer => {
    const { width, height } =
      typeof layer === 'number' ? { width: layer, height: layer } : layer;
    return image.clone().resize(width, height);
  });
  return encodeIco(layers);
}

export default () => ({
  mime: { [MIME_TYPE]: ['ico'] },

  constants: {
    MIME_ICO: MIME_TYPE
  },

  decoders: {
    [MIME_TYPE]: () => {
      throw new Error('decodeIco is not implemented yet');
    }
  },

  encoders: {
    [MIME_TYPE]: encode
  },

  class: {
    // Parameters of ICO layers to be used when saving ICO images
    _icoLayers: [16, 24, 32, 48, 64, 128, 256],
    /**
     * Sets the parameters of ICO layers to be used when saving as JPEG format (default is 100)
     * @param {Array<number|object>} layers parameters of layers
     * @param {function(Error, Jimp)} cb (optional) a callback for when complete
     * @returns {Jimp} this for chaining of methods
     */
    icoLayers(layers, cb) {
      if (!Array.isArray(layers)) {
        return throwError.call(this, 'layers must be an array', cb);
      }

      layers.forEach(layer => {
        if (!isValidLayer(layer)) {
          return throwError.call(
            this,
            'layer must be a number or an object with `width` and `height` properties. Width and height must be in a range [1;256].',
            cb
          );
        }
      });

      this._icoLayers = layers;

      if (isNodePattern(cb)) {
        cb.call(this, null, this);
      }

      return this;
    }
  }
});
