const request = require('sync-request');

module.exports = function(repoIdentifier, executable = false, execType = "none", fileTypeNeeded = "") {
    const parts = repoIdentifier.split('/');
    if (parts.length !== 2) {
        throw new Error("Invalid repo format. Use 'Owner/RepoName'");
    }

    const [owner, repoName] = parts;
    const apiUrl = `https://api.github.com/repos/${owner}/${repoName}/releases`;

    // Initialize base object
    let registryData = {
        name: repoName,
        path: `g/${repoName}`,
        url: []
    };

    try {
        const response = request('GET', apiUrl, {
            headers: { 'User-Agent': 'NodeJS-Update-Module' }
        });

        if (response.statusCode === 200) {
            const releases = JSON.parse(response.getBody('utf8'));

            registryData.url = releases.map(release => {
                return {
                    versionRule: release.tag_name,
                    url: release.assets.length > 0 
                        ? release.assets[0].browser_download_url 
                        : release.zipball_url
                };
            });
        } else {
            console.error(`[Update] Failed to fetch ${repoIdentifier}. Status: ${response.statusCode}`);
        }
    } catch (error) {
        console.error(`[Update] Error fetching repository ${repoIdentifier}:`, error.message);
    }

    // Assign properties to the root level AFTER the URL mapping is done
    // This ensures they appear at the bottom of the JSON object
    registryData.executable = executable;
    registryData.execType = execType;

    return registryData;
};
