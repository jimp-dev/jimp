import {test, assertType, expectTypeOf} from 'vitest'
// eslint-disable-next-line import/no-unresolved
import * as Jimp from "./index";

test("API should have correct methods", () => {
    const jimpInst: Jimp = new Jimp("test");

    expectTypeOf(jimpInst.displace(jimpInst, 2)).toEqualTypeOf<Jimp>();
    expectTypeOf(jimpInst.resize(40, 40)).toEqualTypeOf<Jimp>();
    expectTypeOf(jimpInst.displace(jimpInst, 2)).toEqualTypeOf<Jimp>();
    expectTypeOf(jimpInst.shadow((err, val, coords) => {
    })).toEqualTypeOf<Jimp>();
    expectTypeOf(jimpInst.fishEye({r: 12})).toEqualTypeOf<Jimp>();
    expectTypeOf(jimpInst.circle({radius: 12, x: 12, y: 12})).toEqualTypeOf<Jimp>();
    assertType<Promise<Jimp>>(Jimp.read("Test"));
    assertType<0>(Jimp.PNG_FILTER_NONE);
})

test("API should not have missing methods or properties", () => {
    const jimpInst: Jimp = new Jimp("test");

    // @ts-expect-error
    assertType<never>(jimpInst.read("Test"));

    // @ts-expect-error
    assertType<never>(jimpInst.PNG_FILTER_NONE);

    // @ts-expect-error
    assertType<never>(jimpInst.test);

    // @ts-expect-error
    assertType<never>(jimpInst.func());

    // @ts-expect-error
    assertType<never>(Jimp.test);

    // @ts-expect-error
    assertType<never>(Jimp.func());
})

test("can clone properly", async () => {
    const baseImage = await Jimp.read("filename");
    const cloneBaseImage = baseImage.clone();

    assertType<number>(cloneBaseImage._deflateLevel);
});

test("can clone and handle `this` returns on the core type properly", async () => {
    const baseImage = await Jimp.read("filename");
    const cloneBaseImage = baseImage.clone();

    assertType<number>(cloneBaseImage.posterize(3)._quality);
});

test("can clone and handle `this` returns properly", async () => {
    const baseImage = await Jimp.read("filename");
    const cloneBaseImage = baseImage.clone();

    assertType<number>(
    cloneBaseImage
        .resize(1, 1)
        .crop(0, 0, 0, 0)
        .mask(cloneBaseImage, 2, 2)
        .print("a" as any, 2, 2, "a" as any)
        .resize(1, 1)
        .quality(1)
        .deflateLevel(2)._filterType);
});

test("can clone and handle imageCallbacks `this` properly", async () => {
    const baseImage = await Jimp.read("filename");
    const cloneBaseImage = baseImage.clone();
    const jimpInst: Jimp = new Jimp("test");

    cloneBaseImage.rgba(false, (_, jimpCBIn) => {
        // @ts-expect-error
        assertType<never>(jimpCBIn.read("Test"));
        expectTypeOf(jimpCBIn.displace(jimpInst, 2)).toMatchTypeOf<Jimp>();
        expectTypeOf(jimpCBIn.resize(40, 40)).toMatchTypeOf<Jimp>();
        assertType<number>(jimpCBIn._filterType);

        // @ts-expect-error
        assertType<never>(jimpCBIn.test);

        // @ts-expect-error
        assertType<never>(jimpCBIn.func());
    });
});

test("Can handle callback with constructor", () => {
    const myBmpBuffer: Buffer = {} as any;

    Jimp.read(myBmpBuffer, (err, cbJimpInst) => {
        // @ts-expect-error
        assertType<never>(cbJimpInst.read("Test"));
        expectTypeOf(cbJimpInst.displace(cbJimpInst, 2)).toMatchTypeOf<Jimp>();
        expectTypeOf(cbJimpInst.resize(40, 40)).toMatchTypeOf<Jimp>();
        assertType<number>(cbJimpInst._filterType);

        // @ts-expect-error
        assertType<never>(cbJimpInst.test);

        // @ts-expect-error
        assertType<never>(cbJimpInst.func());
    });
});
