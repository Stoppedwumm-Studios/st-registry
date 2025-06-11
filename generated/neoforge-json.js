// download neoforge installer
const fs = require('fs');
const path = require('path');
const neoforge = require('./neoforge.json');
const {spawnSync} = require('child_process');

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
            const result = spawnSync("java", ["-jar", filePath, "--fat", "jv.jar"], {
                cwd: versionPath,
                stdio: 'inherit',
                shell: true
            });
            if (result.error) {
                console.error(`Error executing Java command: ${result.error.message}`);
            } else if (result.status !== 0) {
                console.error(`Java command failed with status code: ${result.status}`);
            } else {
                console.log(`Java command executed successfully.`);
            }
            // unzip the jar file
            const unzipprocess = spawnSync("unzip", ["jv.jar"], {
                cwd: versionPath,
                stdio: 'inherit',
                shell: true
            });

            if (unzipprocess.error) {
                console.error(`Error executing unzip command: ${unzipprocess.error.message}`);
            } else if (unzipprocess.status !== 0) {
                console.error(`Unzip command failed with status code: ${unzipprocess.status}`);
            } else {
                console.log(`Unzip command executed successfully.`);
            }
            // delete the jar file
            fs.rmSync(path.join(versionPath, 'jv.jar'), { force: true });
            // copy version.json to the version directory
            fs.mkdirSync(path.join(__dirname, "..", "hosted", "neoforge.releases"), { recursive: true });
            fs.copyFileSync(path.join(versionPath, 'version.json'), path.join(__dirname, "..", "hosted", "neoforge.releases", `${version}.json`));

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
        url: "https://github.com/Stoppedwumm-Studios/st-registry/blob/main/docs/files/"+ v + ".json"
    };
});

module.exports = unmodified