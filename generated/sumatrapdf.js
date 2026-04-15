const fs = require('fs');
const path = require('path');

// DEBUG: Check if file exists relative to this script
const targetPath = path.resolve(__dirname, "../lib/update.js");
console.log("Checking path:", targetPath);
console.log("Exists:", fs.existsSync(targetPath));

module.exports = require("../lib/update.js")("sumatrapdfreader/sumatrapdf");
