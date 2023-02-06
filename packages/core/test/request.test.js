import { Jimp as jimp, getTestDir } from "@jimp/test-utils";
import expect from "@storybook/expect";

const fs = require("fs");
const http = require("http");

const imagesDir = getTestDir(__dirname) + "/images";

const httpHandler = (req, res) => {
  switch (req.method) {
    case "GET":
      switch (req.url) {
        case "/redirect.png":
          res.writeHead(301, {
            Location: "http://localhost:5136/corrected.png",
          });
          res.end();
          break;
        case "/corrected.png":
          res.writeHead(200, { "Content-Type": "image/png" });
          res.end(fs.readFileSync(imagesDir + "/pixel.png"), "binary");
          break;
        default:
          res.writeHead(404);
          res.end("Not a valid test endpoint");
          break;
      }

      break;
    default:
      res.writeHead(404);
      res.end("Invalid request method");
      break;
  }
};

describe("request", () => {
  if (typeof window !== "undefined" && typeof window.document !== "undefined") {
    xit("Not testing requests in browser");
  } else {
    const httpServer = http.createServer(httpHandler);
    before(() => {
      httpServer.listen(5136);
    });

    after(() => {
      httpServer.close();
    });

    it("loads standard response", async () => {
      await jimp.read("http://localhost:5136/corrected.png");
    });

    it("follows 301 redirect", async () => {
      await jimp.read("http://localhost:5136/redirect.png");
    });

    it("reports 404 correctly", () => {
      return expect(
        jimp.read("http://localhost:5136/not-found.png")
      ).rejects.toThrow(
        "HTTP Status 404 for url http://localhost:5136/not-found.png"
      );
    });
  }
});
