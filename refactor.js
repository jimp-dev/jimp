const fs = require("fs");
const path = require("path");

function addPublishConfigToPackageJson(directory) {
  fs.readdirSync(directory, { withFileTypes: true }).forEach((entry) => {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      addPublishConfigToPackageJson(fullPath);
    } else if (entry.isFile() && entry.name === "package.json") {
      const packageJson = JSON.parse(fs.readFileSync(fullPath, "utf8"));
      if (!packageJson.publishConfig) {
        packageJson.publishConfig = {};
      }
      packageJson.sideEffects = false;
      fs.writeFileSync(fullPath, JSON.stringify(packageJson, null, 2));
      console.log(`Updated publishConfig in: ${fullPath}`);
    }
  });
}

// Run the script in the current directory
addPublishConfigToPackageJson(".");

console.log("Package.json updates complete.");
