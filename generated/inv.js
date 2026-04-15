const fs = require('fs');
const path = require('path');

// REMOVE the extra arguments from path.resolve
// path.resolve only takes path segments as strings
const targetPath = path.resolve(__dirname, "../lib/update.js");

console.log("Checking path:", targetPath);
console.log("Exists:", fs.existsSync(targetPath));

// Fix the module require path (ensure it matches your file structure)
// You had "lib/update.js" in the console, but "lib/update.js" in the require
const updateModule = require("../lib/update.js"); 

module.exports = updateModule("iv-org/invidious");
