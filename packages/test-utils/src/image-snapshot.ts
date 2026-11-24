import { expect } from "vitest";
import { toMatchImageSnapshot } from "jest-image-snapshot";

declare module "vitest" {
  interface Matchers<R> {
    toMatchImageSnapshot: () => R;
  }
}

expect.extend({ toMatchImageSnapshot });
