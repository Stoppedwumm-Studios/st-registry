const currentConfig = require('./registryConfig.json');
const fs = require('fs');
const path = require('path');

function getInputFromPrompt(prompt) {
    const readline = require('readline');
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    return new Promise((resolve) => {
        rl.question(prompt, (answer) => {
            rl.close();
            resolve(answer);
        });
    });
}

async function main() {
    const name = await getInputFromPrompt('Enter the name of the module: ');
    const pathInput = await getInputFromPrompt('Enter the path of the module: ');
    const urlOrVersion = await getInputFromPrompt('Do you want to enter a URL or a version? (Enter "url" or "version"): ');
    if (urlOrVersion.toLowerCase() === 'url') {
        const url = await getInputFromPrompt('Enter the URL: ');
        currentConfig.module.push({
            name: name,
            path: pathInput,
            url: url
        });
    } else if (urlOrVersion.toLowerCase() === 'version') {
        let versions = []
        while (true) {
            const version = await getInputFromPrompt('Enter the version rule (or "done" to finish): ');
            if (version.toLowerCase() === 'done') {
                break;
            }
            const url = await getInputFromPrompt('Enter the URL: ');
            versions.push({
                versionRule: version,
                url: url
            });
        }
        currentConfig.module.push({
            name: name,
            path: pathInput,
            url: versions
        });
    } else {
        console.error('Invalid input. Please enter "url" or "version".');
        return;
    }
    fs.writeFileSync('./registryConfig.json', JSON.stringify(currentConfig, null, 4));
}

main()