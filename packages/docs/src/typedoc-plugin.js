import { Converter, ReflectionKind } from "typedoc";

export function load(app) {
  const fullSignaturePath = new Map();
  const needsUpdate = new Set();

  let jimpClass;
  let options;

  app.converter.on(Converter.EVENT_CREATE_SIGNATURE, onCreateDeclaration);
  app.converter.on(Converter.EVENT_CREATE_DECLARATION, (c, r) => {
    if (r.name === "JimpConstructorOptions") {
      options = r;
    }
  });

  /**
   *
   * @param {import('typedoc')['Context']} context
   * @param {import('typedoc')['DeclarationReflection']} refl
   */
  function onCreateDeclaration(context, refl) {
    // console.log(refl);
    if (refl.kindOf(ReflectionKind.CallSignature)) {
      if (refl.typeParameters) {
        fullSignaturePath.set(refl.name, refl);
      } else if (refl.parameters?.[0]?.name === "args") {
        needsUpdate.add(refl);
      }
    }

    if (refl.name === "new Jimp") {
      jimpClass = refl;
    }
  }

  app.converter.on(Converter.EVENT_END, (context) => {
    for (const refOrig of needsUpdate) {
      const i = fullSignaturePath.get(refOrig.name);
      refOrig.parameters = i.parameters
        .filter((p, index) => !(p.name === "image" && index === 0))
        .map((p) => {
          console.log(p);
          if (p.type?.name === "I") {
            p.type.name = "Jimp";
          }
          return p;
        });
      refOrig.sources = i.sources;
      refOrig.type = i.type;

      if (refOrig.type.name === "I" || refOrig.type.name.startsWith("I_")) {
        refOrig.type.name = "Jimp";
        refOrig.type.description = "butts";
      }
    }

    if (jimpClass) {
      jimpClass.parameters = [options];
    }
  });
}
