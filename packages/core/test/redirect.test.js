import { Jimp as jimp, getTestDir } from '@jimp/test-utils';

const fs = require('fs');
const http = require('http');

const imagesDir = getTestDir(__dirname) + '/images';

const httpHandler = (req, res) => {
  switch (req.method) {
    case 'GET':
      switch (req.url) {
        case '/redirect.png':
          res.writeHead(301, {
            Location: 'http://localhost:5136/corrected.png'
          });
          res.end();
          break;
        case '/corrected.png':
          res.writeHead(200, { 'Content-Type': 'image/png' });
          res.end(fs.readFileSync(imagesDir + '/pixel.png'), 'binary');
          break;
        default:
          res.writeHead(404);
          res.end('Not a valid test endpoint');
          break;
      }

      break;
    default:
      res.writeHead(404);
      res.end('Invalid request method');
      break;
  }
};

describe('redirect', function() {
  if (typeof window !== 'undefined' && typeof window.document !== 'undefined') {
    xit('Not testing redirects in browser');
  } else {
    const httpServer = http.createServer(httpHandler);
    before(function() {
      httpServer.listen(5136);
    });

    it('follows 301 redirect', function(done) {
      jimp
        .read('http://localhost:5136/redirect.png')
        .then(() => {
          httpServer.close();
          done();
        })
        .catch(error => {
          httpServer.close();
          done(error);
        });
    });
  }
});
