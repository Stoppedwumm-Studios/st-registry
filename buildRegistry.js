const indexFile = require('./lib/indexFile');
const path = require('path');
const fs = require('fs');
const modules = require("./registryConfig.json");

const indexFileContent = indexFile.generateIndexFile(modules.module);

fs.writeFileSync(path.join(__dirname, 'docs', 'index.json'), indexFileContent)

console.log("Index file generated successfully.");
modules.module.forEach(m => {
    fs.mkdirSync(path.join(__dirname, 'docs', path.dirname(m.path)), { recursive: true });
    fs.writeFileSync(path.join(__dirname, 'docs', m.path + '.json'), JSON.stringify(m, null, 2));
    console.log(m.name + " file generated successfully.");
});
modules.module.forEach(m => {
    // make query ready
    if (typeof m.url != "string") {
        fs.mkdirSync(path.join(__dirname, 'docs', m.path), { recursive: true });
        m.url.forEach(u => {
            const version = u.versionRule;
            fs.writeFileSync(path.join(__dirname, 'docs', m.path, version + '.json'), JSON.stringify(u, null, 2));
        })
    }
})

console.log("All files generated successfully.");

fs.readdirSync(path.join(__dirname, "hosted")).forEach(file => {
    const filePath = path.join(__dirname, "hosted", file);
    const stats = fs.statSync(filePath);
    if (stats.isFile()) {
        fs.copyFileSync(filePath, path.join(__dirname, 'docs', "hosted", file));
        console.log(file + " copied successfully.");
    }
}
);