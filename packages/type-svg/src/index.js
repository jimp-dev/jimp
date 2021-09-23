import { Canvg, presets } from 'canvg';
import { DOMParser } from 'xmldom';
import * as canvas from 'canvas';
import fetch from 'node-fetch';

const MIME_TYPE = 'image/svg+xml';

/**
 * @typedef {import('@jimp/core').Jimp} JimpInstance
 */
/**
 * @type {import('@jimp/core').JimpType}
 */
const SVG = {
  mime: { [MIME_TYPE]: ['svg'] },
  hasAlpha: { [MIME_TYPE]: true },

  constants: {
    MIME_SVG: MIME_TYPE
  },

  class: {
    /** @type {typeof canvas.Canvas | undefined} */
    _canvasInstance: undefined,
    /**
     * @type {typeof Canvg | undefined} */
    svgInstance: undefined,
    /** load the svg into a canvas to prepare it to be manipulated
     * @returns {typeof Canvg}
     */
    svgPreload(initWidth = 800, initHeight = 600) {
      const preset = presets.node({
        DOMParser,
        canvas,
        fetch
      });
      this._canvasInstance = preset.createCanvas(initWidth, initHeight);
      const ctx = canvas.getContext('2d');
      const v = Canvg.fromString(
        ctx,
        this.bitmap.data.toString('utf8'),
        preset
      );
      this.svgInstance = v;
      return v;
    },
    /** Replace internal buffer with an image from the canvas
     * @returns {JimpInstance}
     */
    renderSVG(width = 800, height = 600) {
      if (!this.svgInstance) this.svgPreload(width, height);

      this.svgInstance.render();
      this.bitmap = {
        data: this._canvasInstance.toBuffer(),
        width,
        height
      };

      return this;
    }
  },

  decoders: {
    [MIME_TYPE]: data => ({
      data,
      width: 1,
      height: 1
    })
  }
};

export default () => SVG;
