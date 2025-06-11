// download neoforge installer
const fs = require('fs');
const path = require('path');
const neoforge = require('./neoforge.json');

const neoforgeURL = "https://maven.neoforged.net/releases/net/neoforged/neoforge/${version}/neoforge-${version}-installer.jar"

let unmodified = {
    "name": "neoforge-installer",
    "path": "m/nforge",
    "url": [
        {
            "versionRule": "test",
            "url": "https://test.com"
        }
    ]
}

const versions = neoforge.versions
const tmp = path.join(__dirname, 'tmp', 'neoforge');
if (!fs.existsSync(tmp)) {
    fs.mkdirSync(tmp, { recursive: true });
}

for (const version of versions) {
    console.log(version)
    const versionPath = path.join(tmp, version);
    if (!fs.existsSync(versionPath)) {
        fs.mkdirSync(versionPath, { recursive: true });
    }
    const filePath = path.join(versionPath, `neoforge-${version}-installer.jar`);
    if (!fs.existsSync(filePath)) {
        const url = neoforgeURL.replaceAll('${version}', version);
        console.log(url)
        const request = require('sync-request')
        const response = request.default('GET', url)
        if (response.statusCode === 200) {
            console.log(response.getBody().length)
            fs.writeFileSync(filePath, response.getBody());
            console.log(`neoforge ${version} installer downloaded successfully.`);
        } else {
            console.error(`Failed to download neoforge ${version} installer. Status code: ${response.statusCode}`);
        }
    } else {
        console.log(`neoforge ${version} installer already exists.`);
    }
}

unmodified.url = versions.map(v => {
    return {
        versionRule: v,
        url: neoforgeURL.replaceAll('${version}', v)
    };
});

module.exports = unmodified