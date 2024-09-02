import { Converter, TypeScript, Comment } from "typedoc";

function sourceKey(source) {
  return source.fileName + ":" + source.line + ":" + source.character;
}

export function load(app) {
  // schema type alias -> referenced validator
  const schemaTypes = new Map();
  const toUpdate = new Map();

  app.converter.on(Converter.EVENT_END, () => {
    for (const [source, refl] of toUpdate) {
      const matchingSchema = schemaTypes.get(source);

      if (!matchingSchema) {
        continue;
      }

      refl.type.declaration = matchingSchema.type.declaration;
    }
  });
  app.converter.on(Converter.EVENT_CREATE_DECLARATION, onCreateDeclaration);
  app.converter.on(Converter.EVENT_CREATE_SIGNATURE, (_, refl) => {
    const options = refl.parameters?.find((p) => p.name === "options");

    if (!options || !options.type.declaration) {
      return;
    }

    const key = sourceKey(options.type.declaration.sources[0]);
    toUpdate.set(key, options);
  });

  function onCreateDeclaration(_, refl) {
    if (refl.name.endsWith("Options")) {
      const declaration = refl.project
        .getSymbolFromReflection(refl)
        ?.getDeclarations()
        ?.find(TypeScript.isTypeAliasDeclaration);
      const matchingSchema = declaration?.parent.locals.get(
        `${refl.name}Schema`,
      );

      if (!matchingSchema || !refl.type.declaration) {
        return;
      }

      schemaTypes.set(sourceKey(refl.type.declaration.sources[0]), refl);

      refl.type.declaration.children.forEach((child) => {
        child.comment = new Comment([
          {
            kind: "text",
            text: (
              matchingSchema.valueDeclaration ||
              matchingSchema.exportSymbol.valueDeclaration
            ).type.typeArguments[0].symbol.members.get(child.name)
              .valueDeclaration.jsDoc[0].comment,
          },
        ]);
      });
    }
  }
}
