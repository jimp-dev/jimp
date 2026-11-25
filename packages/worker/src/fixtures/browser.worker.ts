import { expose } from "@jimp/worker";
// A JavaScript fixture, shared with the Node.js tests
import { TestJimp } from "./test-jimp.mjs";

expose(TestJimp);
