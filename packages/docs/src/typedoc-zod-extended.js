import { Converter, TypeScript, Comment } from "typedoc";

/**
 * Where a type literal is declared. TypeDoc 0.28 no longer records `sources`
 * for type literals, so read the location from the TypeScript symbol.
 */
function sourceKey(context, refl) {
  const node = context.getSymbolFromReflection(refl)?.declarations?.[0];
  return node && node.getSourceFile().fileName + ":" + node.getStart();
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
  app.converter.on(Converter.EVENT_CREATE_SIGNATURE, (context, refl) => {
    const options = refl.parameters?.find((p) => p.name === "options");

    if (!options || !options.type.declaration) {
      return;
    }

    const key = sourceKey(context, options.type.declaration);
    if (key) toUpdate.set(key, options);
  });

  function onCreateDeclaration(context, refl) {
    if (refl.name.endsWith("Options")) {
      const declaration = context
        .getSymbolFromReflection(refl)
        ?.getDeclarations()
        ?.find(TypeScript.isTypeAliasDeclaration);
      const matchingSchema = declaration?.parent.locals.get(
        `${refl.name}Schema`,
      );

      if (!matchingSchema || !refl.type?.declaration) {
        return;
      }

      const key = sourceKey(context, refl.type.declaration);
      if (key) schemaTypes.set(key, refl);

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
