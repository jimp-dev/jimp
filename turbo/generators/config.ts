import type { PlopTypes } from "@turbo/gen";
import * as path from "path";

// Learn more about Turborepo Generators at https://turbo.build/repo/docs/core-concepts/monorepos/code-generation

export default function generator(plop: PlopTypes.NodePlopAPI): void {
  plop.setGenerator("package", {
    description: "Create a new package",
    prompts: [
      {
        type: "input",
        name: "name",
        message: "What is the name of the package?",
      },
    ],
    actions: [
      {
        type: "addMany",
        templateFiles: "templates/package/**/*",
        base: "templates/package",
        destination: path.join(__dirname, "../../packages/{{kebabCase name}}"),
      },
    ],
  });
  plop.setGenerator("plugin", {
    description: "Create a new plugin",
    prompts: [
      {
        type: "input",
        name: "name",
        message: "What is the name of the plugin?",
      },
    ],
    actions: [
      {
        type: "addMany",
        templateFiles: "templates/package/**/*",
        base: "templates/package",
        destination: path.join(__dirname, "../../plugins/{{kebabCase name}}"),
      },
    ],
  });
}
