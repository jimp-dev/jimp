import { expect } from "vitest";
import { toMatchImageSnapshot } from "jest-image-snapshot";

declare module "vitest" {
  interface Assertion<T> {
    toMatchImageSnapshot: () => T;
  }
}

expect.extend({ toMatchImageSnapshot });
