console.time("build_reg");
const indexFile = require('./lib/indexFile');
const path = require('path');
const fs = require('fs');
let modules = require("./registryConfig.json");

// remove old files
fs.rmSync(path.join(__dirname, 'docs'), { recursive: true, force: true });
fs.mkdirSync(path.join(__dirname, 'docs'), { recursive: true });
fs.mkdirSync(path.join(__dirname, 'docs', 'files'), { recursive: true });
fs.mkdirSync(path.join(__dirname, 'docs', 'm'), { recursive: true });
fs.mkdirSync(path.join(__dirname, 'docs', 'generated'), { recursive: true });
fs.mkdirSync(path.join(__dirname, 'tmp'), { recursive: true });

const generatedModules = fs.readdirSync(path.join(__dirname, 'generated'))

for (const gm of generatedModules) {
    if (!gm.endsWith('.js')) continue; // skip non-js files
    console.log(gm)
    modules.module.push(require(path.join(__dirname, 'generated', gm)));
}

console.time("writeIndexFile");

const indexFileContent = indexFile.generateIndexFile(modules.module);

fs.writeFileSync(path.join(__dirname, 'docs', 'index.json'), indexFileContent)

console.log("===== Index file generated successfully =====");
console.timeEnd("writeIndexFile");
console.log("=============================================");

console.log("Index file generated successfully.");
console.time("writeModuleFiles");
modules.module.forEach(m => {
    fs.mkdirSync(path.join(__dirname, 'docs', path.dirname(m.path)), { recursive: true });
    fs.writeFileSync(path.join(__dirname, 'docs', m.path + '.json'), JSON.stringify(m, null, 2));
    console.log(m.name + " file generated successfully.");
});
console.log("===== Module files generated successfully =====");
console.timeEnd("writeModuleFiles");
console.log("===============================================");
console.time("writeQueryFiles");
modules.module.forEach(m => {
    // make query ready
    if (typeof m.url != "string") {
        fs.mkdirSync(path.join(__dirname, 'docs', m.path), { recursive: true });
        m.url.forEach(u => {
            const version = u.versionRule;
            fs.writeFileSync(path.join(__dirname, 'docs', m.path, version + '.json'), JSON.stringify(u, null, 2));
        })
        let moduleIndexFile = {}
        moduleIndexFile.name = m.name;
        m.url.forEach(u => {
            const version = u.versionRule;
            moduleIndexFile[version] = {
                url: "https://stoppedwumm-studios.github.io/st-registry/" + m.path + "/" + version + ".json"
            }
        })
        fs.writeFileSync(path.join(__dirname, 'docs', m.path, "index.json"), JSON.stringify(moduleIndexFile, null, 2));
    }
})
console.log("===== Query files generated successfully =====");
console.timeEnd("writeQueryFiles");
console.log("==============================================");

console.log("All files generated successfully.");

// copy hosted files
console.time("copyHostedFiles");

fs.cpSync(path.join(__dirname, "hosted"), path.join(__dirname, "docs", "files"), { recursive: true, force: true });
console.log("===== Hosted files copied successfully =====");
console.timeEnd("copyHostedFiles");
console.log("============================================");

console.log("All files copied successfully.");
console.log("Took:")
console.timeEnd("build_reg");