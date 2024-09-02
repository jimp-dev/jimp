const fs = require("fs");
const path = require("path");

function addPublishConfigToPackageJson(directory) {
  fs.readdirSync(directory, { withFileTypes: true }).forEach((entry) => {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      addPublishConfigToPackageJson(fullPath);
    } else if (entry.isFile() && entry.name === ".eslintrc.mjs") {
      fs.unlinkSync(fullPath);
      const dir = path.dirname(fullPath);
      fs.writeFileSync(
        path.join(dir, "eslint.config.mjs"),
        `import shared from "@jimp/config-eslint/base.js";\nexport default [...shared];`
      );
    }
  });
}

// Run the script in the current directory
addPublishConfigToPackageJson(".");

console.log("Package.json updates complete.");
