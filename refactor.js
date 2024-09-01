const fs = require("fs");
const path = require("path");

function addPublishConfigToPackageJson(directory) {
  fs.readdirSync(directory, { withFileTypes: true }).forEach((entry) => {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      addPublishConfigToPackageJson(fullPath);
    } else if (entry.isFile() && entry.name === "package.json") {
      const packageJson = JSON.parse(fs.readFileSync(fullPath, "utf8"));
      if (!packageJson.scripts) {
        packageJson.scripts = {};
      }
      packageJson.scripts.clean = 'rm -rf node_modules .tshy .tshy-build dist .turbo'
      fs.writeFileSync(fullPath, JSON.stringify(packageJson, null, 2));
      console.log(`Updated publishConfig in: ${fullPath}`);
    }
  });
}

// Run the script in the current directory
addPublishConfigToPackageJson(".");

console.log("Package.json updates complete.");
