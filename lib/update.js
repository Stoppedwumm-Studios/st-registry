const request = require('sync-request');

module.exports = function(repoIdentifier, executable = false, execType = "none", fileTypeNeeded = "") {
    const parts = repoIdentifier.split('/');
    if (parts.length !== 2) {
        throw new Error("Invalid repo format. Use 'Owner/RepoName'");
    }

    const [owner, repoName] = parts;
    
    // Define the structure correctly
    let registryData = {
        name: repoName,
        path: `g/${repoName}`,
        url: [],
        executable: executable, // Move these to the root
        execType: execType
    };

    const apiUrl = `https://api.github.com/repos/${owner}/${repoName}/releases`;

    try {
        const response = request('GET', apiUrl, {
            headers: { 'User-Agent': 'NodeJS-Update-Module' }
        });

        if (response.statusCode === 200) {
            const releases = JSON.parse(response.getBody('utf8'));

            registryData.url = releases.map(release => {
                const downloadUrl = release.assets.length > 0 
                    ? release.assets[0].browser_download_url 
                    : release.zipball_url;

                return {
                    versionRule: release.tag_name,
                    url: downloadUrl
                };
            });
        }
    } catch (error) {
        console.error(`[Update] Error:`, error.message);
    }

    return registryData;
};
