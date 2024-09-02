import { Converter, ReflectionKind, ReferenceType } from "typedoc";

export function load(app) {
  const fullSignaturePath = new Map();
  const needsUpdate = new Set();

  const commentMap = new Map();

  let jimpClass;
  let options;

  app.converter.on(Converter.EVENT_CREATE_SIGNATURE, onCreateDeclaration);
  app.converter.on(Converter.EVENT_CREATE_DECLARATION, (_, r) => {
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
    if (refl.kindOf(ReflectionKind.CallSignature)) {
      if (refl.typeParameters) {
        // build a cache of all the types
        fullSignaturePath.set(refl.name, refl);
      } else if (refl.parameters?.[0]?.name === "args") {
        // Recorder ones where the args have been merged
        needsUpdate.add(refl);
      }

      if (refl.comment) {
        // build a cache of all the types
        commentMap.set(refl.name, refl);
      } else if (commentMap.get(refl.name)) {
        refl.comment = commentMap.get(refl.name).comment;
      }
    }

    if (refl.name === "new Jimp") {
      jimpClass = refl;
    }

    // Fix return types
    if (
      refl.type.name === "Promise" &&
      refl.type.typeArguments.some((a) =>
        a.types?.some((t) => t.name === "JimpInstanceMethods"),
      )
    ) {
      refl.type.typeArguments = [
        ReferenceType.createBrokenReference("Jimp", context.project),
      ];
    }

    // Fix parameters
    if (refl.type.types?.some((t) => t.name === "JimpInstanceMethods")) {
      refl.type.types = [
        ReferenceType.createBrokenReference("Jimp", context.project),
      ];
    }
  }

  app.converter.on(Converter.EVENT_END, () => {
    for (const refOrig of needsUpdate) {
      const i = fullSignaturePath.get(refOrig.name);

      if (!i) {
        return;
      }

      refOrig.parameters = i.parameters
        .filter((p, index) => !(p.name === "image" && index === 0))
        .map((p) => {
          if (p.type?.name === "I") {
            p.type.name = "Jimp";
          }
          return p;
        });
      refOrig.sources = i.sources;
      refOrig.type = i.type;

      if (refOrig.type.name === "I" || refOrig.type.name.startsWith("I_")) {
        refOrig.type.name = "Jimp";
      }
    }

    if (jimpClass) {
      jimpClass.parameters = [options];
    }
  });
}
