const request = require('sync-request');

module.exports = function(repoIdentifier) {
    // Split "Owner/Repo"
    const parts = repoIdentifier.split('/');
    if (parts.length !== 2) {
        throw new Error("Invalid repo format. Use 'Owner/RepoName'");
    }

    const owner = parts[0];
    const repoName = parts[1];
    
    // Default structure
    let registryData = {
        "name": repoName,
        "path": `g/${repoName}`,
        "url": []
    };

    const apiUrl = `https://api.github.com/repos/${owner}/${repoName}/releases`;

    try {
        // GitHub API requires a User-Agent
        const response = request('GET', apiUrl, {
            headers: {
                'User-Agent': 'NodeJS-Update-Module',
                // 'Authorization': 'token YOUR_TOKEN' // Add if you hit rate limits
            }
        });

        if (response.statusCode === 200) {
            const releases = JSON.parse(response.getBody('utf8'));

            registryData.url = releases.map(release => {
                // Determine which URL to provide. 
                // We prefer the first 'asset' (like a .jar or .zip), 
                // but fall back to the source code zip if no assets exist.
                const downloadUrl = release.assets.length > 0 
                    ? release.assets[0].browser_download_url 
                    : release.zipball_url;

                return {
                    versionRule: release.tag_name,
                    url: downloadUrl
                };
            });
        } else {
            console.error(`[Update] Failed to fetch ${repoIdentifier}. Status: ${response.statusCode}`);
        }
    } catch (error) {
        console.error(`[Update] Error fetching repository ${repoIdentifier}:`, error.message);
    }

    return registryData;
};