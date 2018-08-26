import should from 'should/as-function';
import { getType, getExtension, addType } from '../../src/utils/mime';

describe('Mime', () => {
  before(() => {
    addType('image/png', ['png']);
    addType('image/gif', ['gif']);
    addType('image/jpeg', ['jpeg', 'jpg']);
    addType('image/bmp', ['bmp']);
    addType('image/tiff', ['tiff']);
  });

  describe('getType', () => {
    it('should return undefined if not found', () => {
      should(getType('/path/to.the/file.boop')).be.exactly(undefined);
    });

    it('should return the correct mime', () => {
      should(getType('/path/to.the/file.png')).be.exactly('image/png');
      should(getType('/path/to.the/file.gif')).be.exactly('image/gif');
      should(getType('/path/to.the/file.jpg')).be.exactly('image/jpeg');
      should(getType('/path/to.the/file.jpeg')).be.exactly('image/jpeg');
      should(getType('/path/to.the/file.bmp')).be.exactly('image/bmp');
      should(getType('/path/to.the/file.tiff')).be.exactly('image/tiff');
    });
  });

  describe('getExtension', () => {
    it('should return undefined if not found', () => {
      should(getExtension('unknown/mime')).be.exactly(undefined);
    });

    it('should return the correct extension', () => {
      should(getExtension('image/png')).be.exactly('png');
      should(getExtension('image/gif')).be.exactly('gif');
      should(getExtension('image/jpeg')).be.exactly('jpeg');
      should(getExtension('image/bmp')).be.exactly('bmp');
      should(getExtension('image/tiff')).be.exactly('tiff');
    });
  });
});
