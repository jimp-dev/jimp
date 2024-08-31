const fs = require("fs");
const path = require("path");

function renameVitestConfigs(directory) {
  fs.readdirSync(directory, { withFileTypes: true }).forEach((entry) => {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      renameVitestConfigs(fullPath);
    } else if (
      entry.isFile() &&
      entry.name.startsWith("vitest.config") &&
      entry.name.endsWith(".cjs")
    ) {
      const newPath = fullPath.slice(0, -4) + ".mjs";
      fs.renameSync(fullPath, newPath);
      console.log(`Renamed: ${fullPath} -> ${newPath}`);
    }
  });
}

// Run the script in the current directory
renameVitestConfigs(".");

console.log("Renaming complete.");
