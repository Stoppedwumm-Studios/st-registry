const fs = require('fs');
const path = require('path');

// REMOVE the extra arguments from path.resolve
// path.resolve only takes path segments as strings
const targetPath = path.resolve(__dirname, "../libs/update.js");

console.log("Checking path:", targetPath);
console.log("Exists:", fs.existsSync(targetPath));

// Fix the module require path (ensure it matches your file structure)
// You had "libs/update.js" in the console, but "lib/update.js" in the require
const updateModule = require("../libs/update.js"); 

module.exports = updateModule("Stoppedwumm/JavaBase", false, "java", "jar");
