/** @author {Stoppedwumm} */

import { test } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';

// test reachability of the server
test('Server is reachable', async () => {
    const response = await fetch('https://stoppedwumm-studios.github.io/st-registry/');
    console.log('Server is reachable');
    assert.strictEqual(response.ok, true, 'Server is not reachable');
});

// test if the index file exists
test('Index file exists', async () => {
    const response = await fetch('https://stoppedwumm-studios.github.io/st-registry/index.json');
    assert.strictEqual(response.ok, true, 'Index file does not exist');
    console.log('Index file exists');
    console.log(await response.text())
});

// test if the index file is valid JSON
test('Index file is valid JSON', async () => {
    const response = await fetch('https://stoppedwumm-studios.github.io/st-registry/index.json');
    const data = await response.json();
    assert.strictEqual(typeof data, 'object', 'Index file is not valid JSON');
    console.log('Index file is valid JSON');
    console.log(data);
});
// test if the index file contains modules
test('Index file contains modules', async () => {
    const response = await fetch('https://stoppedwumm-studios.github.io/st-registry/index.json');
    const data = await response.json();
    assert.ok(Array.isArray(data.modules) && data.modules.length > 0, 'Index file does not contain any modules');
    console.log('Index file contains modules');
    console.log(data.modules);
});
// test if each module has a name and path
test('Each module has a name and path', async () => {
    const response = await fetch('https://stoppedwumm-studios.github.io/st-registry/index.json');
    const data = await response.json();
    data.modules.forEach(module => {
        assert.strictEqual(typeof module.name, 'string', 'Module name is not a string');
        assert.strictEqual(typeof module.path, 'string', 'Module path is not a string');
    });
    console.log('Each module has a name and path');
    data.modules.forEach(module => {
        console.log(`Module: ${module.name}, Path: ${module.path}`);
    });
});
// test if each module has a valid URL
test('Each module has a valid URL', async () => {
    const response = await fetch('https://stoppedwumm-studios.github.io/st-registry/index.json');
    const data = await response.json();
    data.modules.forEach(module => {
        if (typeof module.url === 'string') {
            assert.ok(module.url.startsWith('http'), 'Module URL is not valid');
        } else if (Array.isArray(module.url)) {
            module.url.forEach(urlObj => {
                assert.ok(urlObj.url.startsWith('http'), 'Module URL in array is not valid');
            });
        }
    });
    console.log('Each module has a valid URL');
    data.modules.forEach(module => {
        if (typeof module.url === 'string') {
            console.log(`Module: ${module.name}, URL: ${module.url}`);
        } else if (Array.isArray(module.url)) {
            module.url.forEach(urlObj => {
                console.log(`Module: ${module.name}, URL: ${urlObj.url}`);
            });
        }
    });
})

// test if each module has a valid version rule
test('Each module has a valid version rule', async () => {
    const response = await fetch('https://stoppedwumm-studios.github.io/st-registry/index.json');
    const data = await response.json();
    data.modules.forEach(module => {
        if (Array.isArray(module.url)) {
            module.url.forEach(urlObj => {
                assert.ok(typeof urlObj.versionRule === 'string' && urlObj.versionRule.length > 0, 'Module version rule is not valid');
            });
        }
    });
    console.log('Each module has a valid version rule');
    data.modules.forEach(module => {
        if (Array.isArray(module.url)) {
            module.url.forEach(urlObj => {
                console.log(`Module: ${module.name}, Version Rule: ${urlObj.versionRule}`);
            });
        }
    });
});

// test if each version rule has a valid file
test('Each version rule has a valid file', async () => {
    const response = await fetch('https://stoppedwumm-studios.github.io/st-registry/index.json');
    const data = await response.json();
    for (const module of data.modules) {
        if (Array.isArray(module.url)) {
            for (const urlObj of module.url) {
                const versionResponse = await fetch(urlObj.url);
                assert.strictEqual(versionResponse.ok, true, `Version file for ${urlObj.versionRule} does not exist`);
                const versionData = await versionResponse.json();
                assert.strictEqual(typeof versionData, 'object', `Version file for ${urlObj.versionRule} is not valid JSON`);
            }
        }
    }
    console.log('Each version rule has a valid file');
    data.modules.forEach(module => {
        if (Array.isArray(module.url)) {
            module.url.forEach(urlObj => {
                console.log(`Module: ${module.name}, Version Rule: ${urlObj.versionRule}, URL: ${urlObj.url}`);
            });
        }
    });
})

// write all tests to a file
