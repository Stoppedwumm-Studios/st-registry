const request = require('sync-request');

/**
 * Fetches release data from a GitHub repository to build a registry object.
 */
module.exports = function(repoIdentifier, executable = false, execType = "none", fileTypeNeeded = "") {
    const parts = repoIdentifier.split('/');
    
    if (parts.length !== 2) {
        throw new Error("Invalid repo format. Use 'Owner/RepoName'");
    }

    const [owner, repoName] = parts;
    const registryData = {
        name: repoName,
        path: `g/${repoName}`,
        url: []
    };

    const apiUrl = `https://api.github.com/repos/${owner}/${repoName}/releases`;

    try {
        const response = request('GET', apiUrl, {
            headers: {
                'User-Agent': 'NodeJS-Update-Module'
            }
        });

        if (response.statusCode === 200) {
            const releases = JSON.parse(response.getBody('utf8'));

            registryData.url = releases.map(release => {
                const downloadUrl = release.assets.length > 0 
                    ? release.assets[0].browser_download_url 
                    : release.zipball_url;

                const extension = downloadUrl.split('.').pop();
                
                // Logic: 
                // 1. If fileTypeNeeded is provided, match against extension.
                // 2. Otherwise, use the global executable boolean.
                const isExecutable = fileTypeNeeded !== "" 
                    ? extension === fileTypeNeeded 
                    : executable;

                return {
                    versionRule: release.tag_name,
                    url: downloadUrl,
                    executable: isExecutable,
                    execType: execType
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
