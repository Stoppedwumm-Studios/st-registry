const request = require('sync-request');

module.exports = function(repoIdentifier, executable = false, execType = "none", fileTypeNeeded = "") {
    const parts = repoIdentifier.split('/');
    if (parts.length !== 2) {
        throw new Error("Invalid repo format. Use 'Owner/RepoName'");
    }

    const [owner, repoName] = parts;
    const apiUrl = `https://api.github.com/repos/${owner}/${repoName}/releases`;

    let registryData = {
        name: repoName,
        path: `g/${repoName}`,
        url: [],
        origin: "repoIdentifier"
    };

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

                // Determine file extension
                const extension = downloadUrl.split('.').pop().toLowerCase();
                
                // Logic: If a fileTypeNeeded is provided, check if the extension matches.
                // Otherwise, use the global executable boolean.
                const isExecutable = (fileTypeNeeded !== "") 
                    ? (extension === fileTypeNeeded.toLowerCase()) 
                    : executable;

                return {
                    versionRule: release.tag_name,
                    url: downloadUrl,
                    executable: isExecutable,
                    execType: execType
                };
            });
        }
    } catch (error) {
        console.error(`[Update] Error fetching repository ${repoIdentifier}:`, error.message);
    }

    return registryData;
};
