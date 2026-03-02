const fs = require('fs');
const path = require('path');
const request = require('sync-request'); // Ensure this is installed: npm install sync-request

/**
 * Configuration for the repositories to track.
 * Each entry can specify the owner/repo and which asset to target.
 */
const REPOS = [
    { owner: 'Stoppedwumm', repo: 'JavaBase', assetFilter: (name) => name.endsWith('.jar') }
];

// This is the base format required for the export
let registryData = {
    "name": "github-auto-updater",
    "path": "m/updates",
    "url": []
};

/**
 * Fetches releases from GitHub and populates the registryData.url array.
 */
function updateFromGitHub() {
    const allVersions = [];

    REPOS.forEach(({ owner, repo, assetFilter }) => {
        const apiUrl = `https://api.github.com/repos/${owner}/${repo}/releases`;
        
        try {
            // GitHub API requires a User-Agent header
            const response = request('GET', apiUrl, {
                headers: {
                    'User-Agent': 'NodeJS-Update-Script'
                    // 'Authorization': 'token YOUR_GITHUB_TOKEN' // Uncomment and add token if rate limited
                }
            });

            if (response.statusCode === 200) {
                const releases = JSON.parse(response.getBody('utf8'));

                releases.forEach(release => {
                    const version = release.tag_name;
                    
                    // Find the first asset that matches our filter
                    const targetAsset = release.assets.find(asset => assetFilter(asset.name));

                    if (targetAsset) {
                        allVersions.push({
                            versionRule: `${repo}-${version}`, // Unique identifier combining repo and version
                            url: targetAsset.browser_download_url
                        });
                    }
                });
                console.log(`Successfully fetched ${releases.length} releases for ${owner}/${repo}`);
            } else {
                console.error(`Failed to fetch ${owner}/${repo}. Status: ${response.statusCode}`);
            }
        } catch (error) {
            console.error(`Error processing ${owner}/${repo}:`, error.message);
        }
    });

    registryData.url = allVersions;
}

// Execute the update logic immediately so the data is ready for export
updateFromGitHub();

// Export the populated object in the requested format
module.exports = registryData;